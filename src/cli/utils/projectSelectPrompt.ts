import inquirer from 'inquirer';
import { listProjects } from '../../api/projects.js';
import { User } from '../../types/User.js';

export async function projectSelectPrompt(user: User) {
    const projects = listProjects(user);
    if (projects.length === 0) {
        console.log('❌ No projects available. Please create a project first.');
        return null;
    }

    const { selectedProject } = await inquirer.prompt({
        type: 'list',
        name: 'selectedProject',
        message: 'Select a project:',
        choices: projects.map(p => ({ name: `${p.label} (${p.id})`, value: p.id }))
    });

    return selectedProject;
}
