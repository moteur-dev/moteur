import inquirer from 'inquirer';
import { listEntries } from '@moteur/core/entries.js';
import { User } from '@moteur/types/User.js';

export async function entrySelectPrompt(user: User, projectId: string, modelId: string) {
    const models = listEntries(user, projectId, modelId);
    if (models.length === 0) {
        console.log('❌ No models available. Please create a model schema first.');
        return null;
    }

    const { selectedModel } = await inquirer.prompt({
        type: 'list',
        name: 'selectedModel',
        message: 'Select a model:',
        choices: models.map(m => ({ name: `(${m.id})`, value: m.id }))
    });

    return selectedModel;
}
