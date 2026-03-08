import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import type {
    FormSubmission,
    FormSubmissionMeta,
    FormSubmissionStatus,
    FormActionResult,
    FormAction
} from '@moteur/types/Form.js';
import type { Entry } from '@moteur/types/Model.js';
import { User } from '@moteur/types/User.js';
import { isValidId } from './utils/idUtils.js';
import { submissionFilePath, trashSubmissionDir } from './utils/pathUtils.js';
import { getForm, getFormForProject } from './forms.js';
import { createEntry } from './entries.js';
import { getProjectStorage } from './utils/getProjectStorage.js';
import { getJson, putJson, hasKey } from './utils/storageAdapterUtils.js';
import { submissionKey, submissionListPrefix } from './utils/storageKeys.js';
import { triggerEvent } from './utils/eventBus.js';
import { dispatch as webhookDispatch } from './webhooks/webhookService.js';

function systemUser(): User {
    return { id: 'system', name: 'System', isActive: true, email: '', roles: [], projects: [] };
}

function generateSubmissionId(): string {
    return randomUUID().replace(/-/g, '').slice(0, 12);
}

export interface ListSubmissionsOptions {
    status?: FormSubmissionStatus;
    limit?: number;
}

export async function listSubmissions(
    user: User,
    projectId: string,
    formId: string,
    options?: ListSubmissionsOptions
): Promise<FormSubmission[]> {
    await getForm(user, projectId, formId);

    const storage = getProjectStorage(projectId);
    const ids = await storage.list(submissionListPrefix(formId));
    const submissions: FormSubmission[] = [];

    for (const id of ids) {
        const key = submissionKey(formId, id);
        const sub = await getJson<FormSubmission>(storage, key);
        if (sub) submissions.push(sub);
    }

    let result = submissions;
    if (options?.status !== undefined) {
        result = result.filter(s => s.status === options.status);
    }
    if (options?.limit !== undefined && options.limit > 0) {
        result = result.slice(0, options.limit);
    }
    return result;
}

export async function getSubmission(
    user: User,
    projectId: string,
    formId: string,
    submissionId: string
): Promise<FormSubmission> {
    if (!isValidId(submissionId)) {
        throw new Error(`Invalid submission ID: "${submissionId}"`);
    }

    await getForm(user, projectId, formId);

    const storage = getProjectStorage(projectId);
    const submission = await getJson<FormSubmission>(storage, submissionKey(formId, submissionId));
    if (!submission) {
        throw new Error(
            `Submission "${submissionId}" not found in form "${formId}" of project "${projectId}".`
        );
    }
    return submission;
}

export async function deleteSubmission(
    user: User,
    projectId: string,
    formId: string,
    submissionId: string
): Promise<void> {
    const submission = await getSubmission(user, projectId, formId, submissionId);

    try {
        await triggerEvent('form.submission.beforeDelete', {
            submission,
            user,
            projectId,
            formId
        });
    } catch {
        // event must not fail the operation
    }

    const trashDir = trashSubmissionDir(projectId, formId, submissionId);
    fs.mkdirSync(trashDir, { recursive: true });
    const dest = path.join(trashDir, `submission-${Date.now()}.json`);
    fs.renameSync(submissionFilePath(projectId, formId, submissionId), dest);

    try {
        await triggerEvent('form.submission.afterDelete', {
            submission,
            user,
            projectId,
            formId
        });
    } catch {
        // event must not fail the operation
    }
}

export async function createSubmission(
    projectId: string,
    formId: string,
    data: Record<string, unknown>,
    meta: FormSubmissionMeta
): Promise<FormSubmission> {
    const form = await getFormForProject(projectId, formId);
    if (!form) {
        throw new Error(`Form "${formId}" not found in project "${projectId}".`);
    }

    let id = generateSubmissionId();
    const storage = getProjectStorage(projectId);
    while (await hasKey(storage, submissionKey(formId, id))) {
        id = generateSubmissionId();
    }

    const submission: FormSubmission = {
        id,
        formId,
        projectId,
        data,
        metadata: meta,
        actionResults: [],
        status: 'received'
    };

    await putJson(storage, submissionKey(formId, id), submission);

    void processSubmission(projectId, formId, submission).catch(() => {
        // fire-and-forget; never throw
    });

    return submission;
}

/**
 * Process a form submission: run actions (createEntry, email, webhook), update status and actionResults.
 * Internal use only; not exported from package index.
 */
async function processSubmission(
    projectId: string,
    formId: string,
    submission: FormSubmission
): Promise<void> {
    const form = await getFormForProject(projectId, formId);
    if (!form) return;

    const storage = getProjectStorage(projectId);

    if (submission.metadata.honeypotTriggered && form.honeypot !== false) {
        const updated: FormSubmission = {
            ...submission,
            status: 'spam'
        };
        await putJson(storage, submissionKey(formId, submission.id), updated);
        return;
    }

    const actions: FormAction[] = form.actions ?? [];
    const actionResults: FormActionResult[] = [];

    for (const action of actions) {
        if (action.type === 'createEntry') {
            try {
                const fieldMap = action.fieldMap ?? {};
                const entryData: Record<string, unknown> = {};
                for (const [formFieldId, value] of Object.entries(submission.data)) {
                    if (value === undefined) continue;
                    const modelFieldId = fieldMap[formFieldId] ?? formFieldId;
                    entryData[modelFieldId] = value;
                }
                const entryId = randomUUID().replace(/-/g, '').slice(0, 12);
                const entry: Entry = {
                    id: entryId,
                    type: action.modelId,
                    data: entryData,
                    status: 'draft'
                };
                await createEntry(systemUser(), projectId, action.modelId, entry, {
                    source: 'api'
                });
                actionResults.push({ type: 'createEntry', status: 'success', entryId });
            } catch (err) {
                actionResults.push({
                    type: 'createEntry',
                    status: 'failed',
                    error: err instanceof Error ? err.message : String(err)
                });
            }
        } else if (action.type === 'email') {
            // Stub: real email sending out of scope
            actionResults.push({
                type: 'email',
                status: 'success',
                error: '(email stub: not sent)'
            });
        } else if (action.type === 'webhook') {
            try {
                await webhookDispatch(
                    'form.submitted',
                    {
                        formId,
                        formHandle: form.label ?? form.id,
                        submissionId: submission.id,
                        fields: submission.data
                    },
                    { projectId, source: 'api' }
                );
            } catch {
                // never fail the operation
            }
        }
    }

    // If no webhook action was run, always dispatch form.submitted once
    const hasWebhookAction = actions.some(a => a.type === 'webhook');
    if (!hasWebhookAction) {
        try {
            await webhookDispatch(
                'form.submitted',
                {
                    formId,
                    formHandle: form.label ?? form.id,
                    submissionId: submission.id,
                    fields: submission.data
                },
                { projectId, source: 'api' }
            );
        } catch {
            // never fail the operation
        }
    }

    const updated: FormSubmission = {
        ...submission,
        status: 'processed',
        actionResults
    };
    await putJson(storage, submissionKey(formId, submission.id), updated);

    try {
        await triggerEvent('form.submitted', {
            form,
            submission: updated,
            projectId,
            formId
        });
    } catch {
        // event must not fail the operation
    }
}
