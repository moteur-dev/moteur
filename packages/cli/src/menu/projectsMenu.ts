import inquirer from 'inquirer';
import { listProjects } from '@moteur/core/projects.js';
import { showProjectMenu } from './projectMenu.js';
import { showWelcomeBanner } from '../utils/showWelcomeBanner.js';
import { createProjectCommand } from '../commands/project.js';
import { User } from '@moteur/types/User.js';
import { cliLoadUser } from '../utils/auth.js';

export async function showProjectsMenu() {
    const user: User = cliLoadUser();
    try {
        showWelcomeBanner();
        const projects = await listProjects(user);

        const choices = projects.map(p => ({ name: p.label, value: p.id }));
        choices.push(
            { name: '➕ Create new project', value: '__create' },
            { name: '⬅️ Back', value: '__back' }
        );

        const { selectedProject } = await inquirer.prompt([
            {
                type: 'list',
                name: 'selectedProject',
                message: 'Select a project:',
                choices
            }
        ]);

        if (selectedProject === '__back') return;

        if (selectedProject === '__create') {
            await createProjectCommand({});
            return showProjectsMenu(); // show the list again after creating
        }

        await showProjectMenu(selectedProject);
    } catch (err) {
        if (err instanceof Error && err.name === 'ExitPromptError') {
            console.log('\n👋 Goodbye!'); // noop; silence this error
        } else {
            console.error('\n❌ Error:', err);
        }
        process.exit(1);
    }
}
