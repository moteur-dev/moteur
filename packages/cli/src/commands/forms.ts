import inquirer from 'inquirer';
import { listForms, getForm, createForm, updateForm, deleteForm } from '@moteur/core/forms.js';
import { projectSelectPrompt } from '../utils/projectSelectPrompt.js';
import { resolveInputData } from '../utils/resolveInputData.js';
import { cliLoadUser } from '../utils/auth.js';
import { User } from '@moteur/types/User.js';
import { cliRegistry } from '@moteur/core/registry/CommandRegistry.js';
import { showFormsMenu } from '../menu/formsMenu.js';
import { table } from 'table';
import type { FormSchema, FormStatus } from '@moteur/types/Form.js';

const ID_PATTERN = /^[a-zA-Z0-9_-]+$/;

function validateFormId(input: string): boolean | string {
    if (!input.trim()) return 'ID is required.';
    if (!ID_PATTERN.test(input))
        return 'ID must contain only letters, numbers, hyphens and underscores.';
    return true;
}

export async function listFormsCommand(args: {
    project?: string;
    projectId?: string;
    json?: boolean;
    quiet?: boolean;
}) {
    const user: User = cliLoadUser();
    const projectId = args.project ?? args.projectId;
    const resolvedProjectId = projectId ?? (await projectSelectPrompt(user));

    const forms = await listForms(user, resolvedProjectId);
    if (forms.length === 0) {
        if (!args.quiet) console.log(`📂 No forms found in project "${resolvedProjectId}".`);
        return;
    }
    if (args.json) {
        return console.log(JSON.stringify(forms, null, 2));
    }
    if (!args.quiet) {
        const rows = [['ID', 'Label', 'Status', 'Fields', 'Created']];
        for (const f of forms) {
            const fieldCount =
                typeof f.fields === 'object' && f.fields !== null
                    ? Object.keys(f.fields).length
                    : 0;
            const created = f.createdAt ? new Date(f.createdAt).toLocaleDateString() : '—';
            rows.push([f.id, f.label, f.status ?? 'active', String(fieldCount), created]);
        }
        console.log(`\n🗒 Forms in project "${resolvedProjectId}":\n`);
        console.log(table(rows));
    }
}

export async function getFormCommand(args: {
    project?: string;
    projectId?: string;
    id?: string;
    json?: boolean;
    quiet?: boolean;
}) {
    const user: User = cliLoadUser();
    const projectId = args.project ?? args.projectId ?? (await projectSelectPrompt(user));
    const formId = args.id;
    if (!formId) {
        throw new Error('--id is required. Example: forms get --project=site1 --id=contact');
    }

    const form = await getForm(user, projectId, formId);
    if (args.json) {
        return console.log(JSON.stringify(form, null, 2));
    }
    if (!args.quiet) {
        console.log(`\n🗒 Form "${form.id}":\n`);
        console.log('Basic:');
        console.log(`  id: ${form.id}`);
        console.log(`  label: ${form.label}`);
        console.log(`  description: ${form.description ?? '—'}`);
        console.log(`  status: ${form.status ?? 'active'}`);
        console.log(`  createdAt: ${form.createdAt ?? '—'}`);
        console.log(`  updatedAt: ${form.updatedAt ?? '—'}`);
        if (
            form.submitLabel ||
            form.successMessage ||
            form.redirectUrl != null ||
            form.honeypot != null
        ) {
            console.log('Settings:');
            if (form.submitLabel) console.log(`  submitLabel: ${JSON.stringify(form.submitLabel)}`);
            if (form.successMessage)
                console.log(`  successMessage: ${JSON.stringify(form.successMessage)}`);
            if (form.redirectUrl) console.log(`  redirectUrl: ${form.redirectUrl}`);
            if (form.honeypot !== undefined) console.log(`  honeypot: ${form.honeypot}`);
        }
        if (form.fields && Object.keys(form.fields).length > 0) {
            console.log('Fields:');
            for (const [key, def] of Object.entries(form.fields)) {
                console.log(
                    `  ${key}: ${(def as { type?: string }).type ?? '?'} (${(def as { label?: string }).label ?? key})`
                );
            }
        }
        if (form.actions && form.actions.length > 0) {
            console.log('Actions:', JSON.stringify(form.actions, null, 2));
        }
        if (form.notifications) {
            console.log('Notifications:', JSON.stringify(form.notifications, null, 2));
        }
    }
}

export async function createFormCommand(args: {
    project?: string;
    projectId?: string;
    file?: string;
    data?: string;
    quiet?: boolean;
    json?: boolean;
}) {
    const user: User = cliLoadUser();
    const projectId = args.project ?? args.projectId ?? (await projectSelectPrompt(user));

    const hasFileOrData = !!(args.file || args.data);
    let payload: Partial<FormSchema> & { id: string };

    if (hasFileOrData) {
        const raw = await resolveInputData({
            file: args.file,
            data: args.data,
            interactiveFields: []
        });
        const {
            createdAt: _createdAt,
            updatedAt: _updatedAt,
            ...rest
        } = raw as FormSchema & {
            createdAt?: string;
            updatedAt?: string;
        };
        if (!rest.id) throw new Error('Form "id" is required in --file or --data.');
        payload = { ...rest, id: String(rest.id).trim() };
    } else {
        console.log(
            'Please provide the form details (basic info only). Use --file or --data for full schema including fields, actions, notifications.\n'
        );
        const answers = (await inquirer.prompt([
            {
                type: 'input',
                name: 'id',
                message: 'Form ID:',
                validate: (v: string) => validateFormId(v)
            },
            {
                type: 'input',
                name: 'label',
                message: 'Label:',
                validate: (v: string) => (v?.trim() ? true : 'Label is required.')
            },
            { type: 'input', name: 'description', message: 'Description (optional):' },
            {
                type: 'list',
                name: 'status',
                message: 'Status:',
                default: 'active',
                choices: [
                    { name: 'Active', value: 'active' },
                    { name: 'Inactive', value: 'inactive' },
                    { name: 'Archived', value: 'archived' }
                ]
            },
            { type: 'input', name: 'submitLabel', message: 'Submit button label (optional):' },
            { type: 'input', name: 'successMessage', message: 'Success message (optional):' },
            { type: 'input', name: 'redirectUrl', message: 'Redirect URL (optional):' },
            {
                type: 'confirm',
                name: 'honeypot',
                message: 'Enable honeypot spam protection?',
                default: true
            }
        ])) as {
            id: string;
            label: string;
            description?: string;
            status: FormStatus;
            submitLabel?: string;
            successMessage?: string;
            redirectUrl?: string;
            honeypot: boolean;
        };
        payload = {
            id: answers.id.trim(),
            label: answers.label.trim(),
            description: answers.description?.trim() || undefined,
            status: answers.status,
            submitLabel: answers.submitLabel?.trim()
                ? { default: answers.submitLabel.trim() }
                : undefined,
            successMessage: answers.successMessage?.trim()
                ? { default: answers.successMessage.trim() }
                : undefined,
            redirectUrl: answers.redirectUrl?.trim() || undefined,
            honeypot: answers.honeypot,
            fields: {}
        };
    }

    const created = await createForm(user, projectId, payload as FormSchema);
    if (args.json) return console.log(JSON.stringify(created, null, 2));
    if (!args.quiet) {
        console.log(`✅ Created form "${created.id}" in project "${projectId}".`);
        if (!hasFileOrData) {
            console.log(
                'To add fields, actions, or notifications use: forms patch --project=' +
                    projectId +
                    ' --id=' +
                    created.id +
                    ' --file=form.json'
            );
            console.log('Or edit in the Studio.');
        }
    }
    return created;
}

export async function patchFormCommand(args: {
    project?: string;
    projectId?: string;
    id?: string;
    file?: string;
    data?: string;
    quiet?: boolean;
    json?: boolean;
}) {
    const user: User = cliLoadUser();
    const projectId = args.project ?? args.projectId ?? (await projectSelectPrompt(user));
    const formId = args.id;
    if (!formId)
        throw new Error('--id is required. Example: forms patch --project=site1 --id=contact');

    const hasFileOrData = !!(args.file || args.data);
    let patch: Partial<FormSchema>;

    if (hasFileOrData) {
        const raw = await resolveInputData({
            file: args.file,
            data: args.data,
            interactiveFields: []
        });
        const {
            id: _id,
            createdAt: _createdAt,
            updatedAt: _updatedAt,
            ...rest
        } = raw as FormSchema & {
            createdAt?: string;
            updatedAt?: string;
        };
        patch = rest;
    } else {
        console.log('Patch form (basic fields only). Use --file for full control.\n');
        const answers = (await inquirer.prompt([
            {
                type: 'input',
                name: 'label',
                message: 'Label:',
                validate: (v: string) => (v?.trim() ? true : 'Label is required.')
            },
            { type: 'input', name: 'description', message: 'Description (optional):' },
            {
                type: 'list',
                name: 'status',
                message: 'Status:',
                choices: [
                    { name: 'Active', value: 'active' },
                    { name: 'Inactive', value: 'inactive' },
                    { name: 'Archived', value: 'archived' }
                ]
            },
            { type: 'input', name: 'submitLabel', message: 'Submit button label (optional):' },
            { type: 'input', name: 'successMessage', message: 'Success message (optional):' },
            { type: 'input', name: 'redirectUrl', message: 'Redirect URL (optional):' },
            { type: 'confirm', name: 'honeypot', message: 'Enable honeypot?', default: true }
        ])) as {
            label: string;
            description?: string;
            status: FormStatus;
            submitLabel?: string;
            successMessage?: string;
            redirectUrl?: string;
            honeypot: boolean;
        };
        patch = {
            label: answers.label.trim(),
            description: answers.description?.trim() || undefined,
            status: answers.status,
            submitLabel: answers.submitLabel?.trim()
                ? { default: answers.submitLabel.trim() }
                : undefined,
            successMessage: answers.successMessage?.trim()
                ? { default: answers.successMessage.trim() }
                : undefined,
            redirectUrl: answers.redirectUrl?.trim() || undefined,
            honeypot: answers.honeypot
        };
    }

    const updated = await updateForm(user, projectId, formId, patch);
    if (!args.quiet) console.log(`🔧 Patched form "${formId}" in project "${projectId}".`);
    if (args.json) return console.log(JSON.stringify(updated, null, 2));
    return updated;
}

export async function deleteFormCommand(args: {
    project?: string;
    projectId?: string;
    id?: string;
    quiet?: boolean;
}) {
    const user: User = cliLoadUser();
    const projectId = args.project ?? args.projectId ?? (await projectSelectPrompt(user));
    const formId = args.id;
    if (!formId)
        throw new Error('--id is required. Example: forms delete --project=site1 --id=contact');

    await deleteForm(user, projectId, formId);
    if (!args.quiet) console.log(`🗑️ Form "${formId}" moved to trash in project "${projectId}".`);
}

cliRegistry.register('forms', {
    name: '',
    description: 'Interactive forms menu',
    action: async (opts: { project?: string; projectId?: string }) => {
        const user = cliLoadUser();
        const projectId = opts.project ?? opts.projectId ?? (await projectSelectPrompt(user));
        await showFormsMenu(projectId);
    }
});

cliRegistry.register('forms', {
    name: 'list',
    description: 'List all forms in a project',
    action: listFormsCommand
});
cliRegistry.register('forms', {
    name: 'get',
    description: 'Get one form (full schema)',
    action: getFormCommand
});
cliRegistry.register('forms', {
    name: 'create',
    description: 'Create a new form',
    action: createFormCommand
});
cliRegistry.register('forms', {
    name: 'patch',
    description: 'Update an existing form',
    action: patchFormCommand
});
cliRegistry.register('forms', {
    name: 'delete',
    description: 'Soft-delete a form',
    action: deleteFormCommand
});
