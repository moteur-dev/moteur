import inquirer from 'inquirer';
import { listProjects } from '../../api/projects';
import { User } from '../../types/User';

export async function projectSelectPrompt(user: User): Promise<string> {
    const projects = listProjects(user);
    if (projects.length === 0) {
        throw new Error('No projects available. Please create a project first');
    }

    const { selectedProject } = await inquirer.prompt({
        type: 'list',
        name: 'selectedProject',
        message: 'Select a project:',
        choices: projects.map(p => ({ name: `${p.label} (${p.id})`, value: p.id }))
    });

    return selectedProject;
}
