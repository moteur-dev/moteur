import inquirer from 'inquirer';
import {
    listSubmissionsCommand,
    getSubmissionCommand,
    deleteSubmissionCommand,
    exportSubmissionsCommand
} from '../commands/submissions.js';

export async function showSubmissionsMenu(projectId: string, formId: string) {
    try {
        console.clear();
        console.log(`\n📥 Submissions for Form: ${formId} in Project: ${projectId}`);

        const { submissionAction } = await inquirer.prompt([
            {
                type: 'list',
                name: 'submissionAction',
                message: `Choose an action for submissions of "${formId}":`,
                choices: [
                    { name: '📂 List submissions', value: 'list' },
                    { name: '👁️ View one submission', value: 'get' },
                    { name: '🗑️ Delete submission', value: 'delete' },
                    { name: '📤 Export to CSV/JSON', value: 'export' },
                    new inquirer.Separator(),
                    { name: '⬅️ Back to forms', value: 'back' }
                ]
            }
        ]);

        switch (submissionAction) {
            case 'list':
                await listSubmissionsCommand({ projectId, form: formId });
                break;
            case 'get': {
                const { submissionId } = await inquirer.prompt({
                    type: 'input',
                    name: 'submissionId',
                    message: 'Enter the submission ID to view:'
                });
                await getSubmissionCommand({ projectId, form: formId, id: submissionId });
                break;
            }
            case 'delete': {
                const { submissionId } = await inquirer.prompt({
                    type: 'input',
                    name: 'submissionId',
                    message: 'Enter the submission ID to delete:'
                });
                await deleteSubmissionCommand({ projectId, form: formId, id: submissionId });
                break;
            }
            case 'export': {
                const { format } = await inquirer.prompt({
                    type: 'list',
                    name: 'format',
                    message: 'Export format:',
                    choices: [
                        { name: 'CSV', value: 'csv' },
                        { name: 'JSON', value: 'json' }
                    ]
                });
                await exportSubmissionsCommand({ projectId, form: formId, format });
                break;
            }
            case 'back':
                return;
        }

        await inquirer.prompt([
            { type: 'input', name: 'continue', message: 'Press Enter to continue...' }
        ]);
        await showSubmissionsMenu(projectId, formId);
    } catch (err) {
        if (err instanceof Error && err.name === 'ExitPromptError') {
            console.log('\n👋 Goodbye!');
        } else {
            console.error('\n❌ Error:', err);
        }
        process.exit(1);
    }
}
