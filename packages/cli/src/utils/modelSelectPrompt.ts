import inquirer from 'inquirer';
import { listModelSchemas } from '@moteur/core/models.js';
import { User } from '@moteur/types/User.js';

export async function modelSelectPrompt(user: User, projectId: string) {
    const models = listModelSchemas(user, projectId);
    if (models.length === 0) {
        console.log('❌ No models available. Please create a model schema first.');
        return null;
    }

    const { selectedModel } = await inquirer.prompt({
        type: 'list',
        name: 'selectedModel',
        message: 'Select a model:',
        choices: models.map(m => ({ name: `${m.label} (${m.id})`, value: m.id }))
    });

    return selectedModel;
}
