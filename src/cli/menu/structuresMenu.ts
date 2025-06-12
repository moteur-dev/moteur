import inquirer from 'inquirer';
import { listProjects } from '../../api/projects.js';
import {
    listStructuresCommand,
    getStructureCommand,
    createStructureCommand,
    patchStructureCommand,
    deleteStructureCommand
} from '../commands/structures.js';
import { showWelcomeBanner } from '../utils/showWelcomeBanner.js';
import { projectSelectPrompt } from '../utils/projectSelectPrompt.js';
import { User } from '../../types/User.js';
import { cliLoadUser } from '../utils/auth.js';

export async function showStructuresMenu(project?: string) {
    const user: User = cliLoadUser();
    showWelcomeBanner();

    if (!project) {
        project = await projectSelectPrompt(user);
    }

    console.clear();
    showWelcomeBanner();
    console.log(`\n📁 Structure Management for Project: ${project}`);

    const { action } = await inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'Choose an action:',
            choices: [
                { name: '📁 List structures', value: 'list' },
                { name: '➕ Create a new structure', value: 'create' },
                { name: '🔧 Edit a structure', value: 'edit' },
                { name: '🗑️ Delete a structure', value: 'delete' },
                new inquirer.Separator(),
                { name: '🔙 Back to project menu', value: 'back' }
            ]
        }
    ]);

    switch (action) {
        case 'list':
            await listStructuresCommand({ project: project });
            break;
        case 'create':
            //await createStructureCommand( { project: project });
            break;
        case 'edit': {
            const { structureId } = await inquirer.prompt({
                type: 'input',
                name: 'structureId',
                message: 'Enter the structure ID to edit:'
            });
            //await patchStructureCommand({ project: project, id: structureId });
            break;
        }
        case 'delete': {
            const { structureId } = await inquirer.prompt({
                type: 'input',
                name: 'structureId',
                message: 'Enter the structure ID to delete:'
            });
            //await deleteStructureCommand({ project: project, id: structureId });
            break;
        }
        case 'back':
            return;
    }

    await inquirer.prompt([
        { type: 'input', name: 'continue', message: 'Press Enter to continue...' }
    ]);
    await showStructuresMenu(project);
}
