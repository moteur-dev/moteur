import fs from 'fs';
import { listSubmissions, getSubmission, deleteSubmission } from '@moteur/core/formSubmissions.js';
import { projectSelectPrompt } from '../utils/projectSelectPrompt.js';
import { formSelectPrompt } from '../utils/formSelectPrompt.js';
import { cliLoadUser } from '../utils/auth.js';
import { User } from '@moteur/types/User.js';
import { cliRegistry } from '@moteur/core/registry/CommandRegistry.js';
import { showSubmissionsMenu } from '../menu/submissionsMenu.js';
import { table } from 'table';
import type { FormSubmissionStatus } from '@moteur/types/Form.js';

const statusColors: Record<FormSubmissionStatus, string> = {
    received: '\x1b[34m', // blue
    processed: '\x1b[32m', // green
    spam: '\x1b[31m' // red
};
const reset = '\x1b[0m';

function colorizeStatus(status: FormSubmissionStatus): string {
    const code = statusColors[status];
    return code ? `${code}${status}${reset}` : status;
}

function truncateId(id: string, max = 12): string {
    return id.length <= max ? id : id.slice(0, max) + '…';
}

function requireForm(args: { form?: string }, user: User, projectId: string): Promise<string> {
    if (args.form) return Promise.resolve(args.form);
    return formSelectPrompt(user, projectId).then(f => {
        if (!f)
            throw new Error(
                '--form is required. Example: submissions list --project=site1 --form=contact'
            );
        return f;
    });
}

export async function listSubmissionsCommand(args: {
    project?: string;
    projectId?: string;
    form?: string;
    status?: string;
    limit?: string;
    json?: boolean;
    quiet?: boolean;
}) {
    const user: User = cliLoadUser();
    const projectId = args.project ?? args.projectId ?? (await projectSelectPrompt(user));
    const formId = await requireForm(args, user, projectId);

    const options: { status?: FormSubmissionStatus; limit?: number } = {};
    if (args.status) options.status = args.status as FormSubmissionStatus;
    if (args.limit) options.limit = Math.max(0, parseInt(args.limit, 10) || 50);

    const submissions = await listSubmissions(user, projectId, formId, options);
    if (submissions.length === 0) {
        if (!args.quiet) console.log(`📂 No submissions found for form "${formId}".`);
        return;
    }
    if (args.json) return console.log(JSON.stringify(submissions, null, 2));
    if (!args.quiet) {
        const rows = [['ID', 'Status', 'Submitted at', 'IP']];
        for (const s of submissions) {
            const submittedAt = s.metadata?.submittedAt
                ? new Date(s.metadata.submittedAt).toLocaleString()
                : '—';
            const ip = s.metadata?.ip ?? '—';
            rows.push([truncateId(s.id), colorizeStatus(s.status), submittedAt, ip]);
        }
        console.log(`\n📥 Submissions for form "${formId}" in project "${projectId}":\n`);
        console.log(table(rows));
    }
}

export async function getSubmissionCommand(args: {
    project?: string;
    projectId?: string;
    form?: string;
    id?: string;
    json?: boolean;
    quiet?: boolean;
}) {
    const user: User = cliLoadUser();
    const projectId = args.project ?? args.projectId ?? (await projectSelectPrompt(user));
    const formId = await requireForm(args, user, projectId);
    const submissionId = args.id;
    if (!submissionId)
        throw new Error(
            '--id is required. Example: submissions get --project=site1 --form=contact --id=sub123'
        );

    const submission = await getSubmission(user, projectId, formId, submissionId);
    if (args.json) return console.log(JSON.stringify(submission, null, 2));
    if (!args.quiet) {
        const meta = submission.metadata ?? {};
        console.log(`\n📥 Submission "${submission.id}":\n`);
        console.log('Basic:');
        console.log(`  id: ${submission.id}`);
        console.log(`  formId: ${submission.formId}`);
        console.log(`  status: ${submission.status}`);
        console.log(`  submittedAt: ${meta.submittedAt ?? '—'}`);
        console.log('Submitted data:');
        for (const [k, v] of Object.entries(submission.data ?? {})) {
            const val = typeof v === 'object' && v !== null ? JSON.stringify(v) : String(v);
            console.log(`  ${k}: ${val}`);
        }
        const metaKeys = [
            'ip',
            'userAgent',
            'locale',
            'honeypotTriggered',
            'recaptchaScore'
        ] as const;
        let hasMeta = false;
        for (const key of metaKeys) {
            const val = meta[key];
            if (val !== undefined && val !== null && val !== '') {
                if (!hasMeta) {
                    console.log('Metadata:');
                    hasMeta = true;
                }
                console.log(`  ${key}: ${val}`);
            }
        }
        if (submission.actionResults && submission.actionResults.length > 0) {
            console.log('Action results:');
            for (const ar of submission.actionResults) {
                console.log(
                    `  ${ar.type}: ${ar.status}${ar.entryId ? ` entryId=${ar.entryId}` : ''}${ar.error ? ` error=${ar.error}` : ''}`
                );
            }
        }
    }
}

export async function deleteSubmissionCommand(args: {
    project?: string;
    projectId?: string;
    form?: string;
    id?: string;
    quiet?: boolean;
}) {
    const user: User = cliLoadUser();
    const projectId = args.project ?? args.projectId ?? (await projectSelectPrompt(user));
    const formId = await requireForm(args, user, projectId);
    const submissionId = args.id;
    if (!submissionId)
        throw new Error(
            '--id is required. Example: submissions delete --project=site1 --form=contact --id=sub123'
        );

    await deleteSubmission(user, projectId, formId, submissionId);
    if (!args.quiet) console.log(`🗑️ Submission "${submissionId}" moved to trash.`);
}

function escapeCsvCell(val: unknown): string {
    if (val === null || val === undefined) return '';
    if (typeof val === 'object') return JSON.stringify(val);
    const s = String(val);
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
}

export async function exportSubmissionsCommand(args: {
    project?: string;
    projectId?: string;
    form?: string;
    format?: string;
    output?: string;
    status?: string;
    limit?: string;
    quiet?: boolean;
    json?: boolean;
}) {
    const user: User = cliLoadUser();
    const projectId = args.project ?? args.projectId ?? (await projectSelectPrompt(user));
    const formId = await requireForm(args, user, projectId);

    const format = (args.format ?? '').toLowerCase();
    if (format !== 'csv' && format !== 'json') {
        throw new Error(
            '--format is required and must be "csv" or "json". Example: submissions export --project=site1 --form=contact --format=csv'
        );
    }

    const options: { status?: FormSubmissionStatus; limit?: number } = {};
    if (args.status) options.status = args.status as FormSubmissionStatus;
    if (args.limit) options.limit = Math.max(0, parseInt(args.limit, 10));

    const submissions = await listSubmissions(user, projectId, formId, options);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const defaultFileName = `submissions-${formId}-${timestamp}.${format === 'csv' ? 'csv' : 'json'}`;
    const outPath = args.output ?? defaultFileName;

    if (format === 'csv') {
        const dataKeys = new Set<string>();
        for (const s of submissions) {
            Object.keys(s.data ?? {}).forEach(k => dataKeys.add(k));
        }
        const fixedCols = ['id', 'status', 'submittedAt', 'ip', 'locale'];
        const header = [...fixedCols, ...Array.from(dataKeys).sort()];
        const rows = [header];
        for (const s of submissions) {
            const meta = s.metadata ?? {};
            const row = [s.id, s.status, meta.submittedAt ?? '', meta.ip ?? '', meta.locale ?? ''];
            for (const k of Array.from(dataKeys).sort()) {
                row.push(escapeCsvCell((s.data ?? {})[k]));
            }
            rows.push(row);
        }
        const csvContent = rows.map(row => row.map(escapeCsvCell).join(',')).join('\n');
        fs.writeFileSync(outPath, csvContent, 'utf-8');
    } else {
        fs.writeFileSync(outPath, JSON.stringify(submissions, null, 2), 'utf-8');
    }

    if (args.json) {
        return console.log(JSON.stringify({ exported: submissions.length, path: outPath }));
    }
    if (!args.quiet) {
        console.log(`Exported ${submissions.length} submissions to ${outPath}`);
    }
}

cliRegistry.register('submissions', {
    name: '',
    description: 'Interactive submissions menu',
    action: async (opts: { project?: string; projectId?: string; form?: string }) => {
        const user = cliLoadUser();
        const projectId = opts.project ?? opts.projectId ?? (await projectSelectPrompt(user));
        const formId = opts.form ?? (await formSelectPrompt(user, projectId));
        if (!formId) throw new Error('Form is required. Select a form or use --form=...');
        await showSubmissionsMenu(projectId, formId);
    }
});

cliRegistry.register('submissions', {
    name: 'list',
    description: 'List submissions for a form',
    action: listSubmissionsCommand
});
cliRegistry.register('submissions', {
    name: 'get',
    description: 'Get one submission',
    action: getSubmissionCommand
});
cliRegistry.register('submissions', {
    name: 'delete',
    description: 'Soft-delete a submission',
    action: deleteSubmissionCommand
});
cliRegistry.register('submissions', {
    name: 'export',
    description: 'Export submissions to CSV or JSON file',
    action: exportSubmissionsCommand
});
