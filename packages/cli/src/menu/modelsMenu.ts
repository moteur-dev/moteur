// src/cli/menu/modelsMenu.ts
import inquirer from 'inquirer';
import {
    listModelSchemasCommand,
    getModelSchemaCommand,
    createModelSchemaCommand,
    patchModelSchemaCommand,
    deleteModelSchemaCommand
} from '../commands/models';
import { showEntriesMenu } from './entriesMenu';
import { showWelcomeBanner } from '../utils/showWelcomeBanner';
import { projectSelectPrompt } from '../utils/projectSelectPrompt';
import { User } from '@moteur/types/User';
import { cliLoadUser } from '../utils/auth';

export async function showModelSchemasMenu(project: string) {
    const user: User = cliLoadUser();
    showWelcomeBanner();
    if (!project) {
        project = await projectSelectPrompt(user);
    }

    console.clear();

    console.log(`\n📦 Model Management for Project: ${project}`);

    const { action } = await inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'Choose an action:',
            choices: [
                { name: '📦 List model schemas', value: 'list' },
                { name: '➕ Create a new model schema', value: 'create' },
                { name: '🔧 Edit a model schema', value: 'edit' },
                { name: '🗑️ Delete a model schema', value: 'delete' },
                new inquirer.Separator(),
                { name: '📁 View entries for a model', value: 'entries' },
                new inquirer.Separator(),
                { name: '🔙 Back to project menu', value: 'back' }
            ]
        }
    ]);

    switch (action) {
        case 'list':
            await listModelSchemasCommand({ projectId: project });
            break;
        case 'create':
            await createModelSchemaCommand({ projectId: project });
            break;
        case 'edit': {
            const { modelId } = await inquirer.prompt({
                type: 'input',
                name: 'modelId',
                message: 'Enter the model schema ID to edit:'
            });
            await patchModelSchemaCommand({ projectId: project, id: modelId });
            break;
        }
        case 'delete': {
            const { modelId } = await inquirer.prompt({
                type: 'input',
                name: 'modelId',
                message: 'Enter the model schema ID to delete:'
            });
            await deleteModelSchemaCommand({ projectId: project, id: modelId });
            break;
        }
        case 'entries': {
            const { modelId } = await inquirer.prompt({
                type: 'input',
                name: 'modelId',
                message: 'Enter the model ID to view entries:'
            });
            await showEntriesMenu(project, modelId);
            break;
        }
        case 'back':
            return;
    }

    await inquirer.prompt([
        { type: 'input', name: 'continue', message: 'Press Enter to continue...' }
    ]);
    await showModelSchemasMenu(project);
}
