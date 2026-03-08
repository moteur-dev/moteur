import inquirer from 'inquirer';
import {
    listFormsCommand,
    createFormCommand,
    patchFormCommand,
    deleteFormCommand
} from '../commands/forms.js';
import { showSubmissionsMenu } from './submissionsMenu.js';
import { showWelcomeBanner } from '../utils/showWelcomeBanner.js';
import { projectSelectPrompt } from '../utils/projectSelectPrompt.js';
import { User } from '@moteur/types/User.js';
import { cliLoadUser } from '../utils/auth.js';

export async function showFormsMenu(project: string) {
    const user: User = cliLoadUser();
    showWelcomeBanner();
    if (!project) {
        project = await projectSelectPrompt(user);
    }

    console.clear();
    console.log(`\n🗒 Forms for Project: ${project}`);

    const { action } = await inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'Choose an action:',
            choices: [
                { name: '📋 List forms', value: 'list' },
                { name: '➕ Create a new form', value: 'create' },
                { name: '🔧 Edit a form', value: 'edit' },
                { name: '🗑️ Delete a form', value: 'delete' },
                new inquirer.Separator(),
                { name: '📥 View submissions for a form', value: 'submissions' },
                new inquirer.Separator(),
                { name: '🔙 Back to project menu', value: 'back' }
            ]
        }
    ]);

    switch (action) {
        case 'list':
            await listFormsCommand({ projectId: project });
            break;
        case 'create':
            await createFormCommand({ projectId: project });
            break;
        case 'edit': {
            const { formId } = await inquirer.prompt({
                type: 'input',
                name: 'formId',
                message: 'Enter the form ID to edit:'
            });
            await patchFormCommand({ projectId: project, id: formId });
            break;
        }
        case 'delete': {
            const { formId } = await inquirer.prompt({
                type: 'input',
                name: 'formId',
                message: 'Enter the form ID to delete:'
            });
            await deleteFormCommand({ projectId: project, id: formId });
            break;
        }
        case 'submissions': {
            const { formId } = await inquirer.prompt({
                type: 'input',
                name: 'formId',
                message: 'Enter the form ID to view submissions:'
            });
            await showSubmissionsMenu(project, formId);
            break;
        }
        case 'back':
            return;
    }

    await inquirer.prompt([
        { type: 'input', name: 'continue', message: 'Press Enter to continue...' }
    ]);
    await showFormsMenu(project);
}
