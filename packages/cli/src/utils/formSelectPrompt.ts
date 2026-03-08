import inquirer from 'inquirer';
import { listForms } from '@moteur/core/forms.js';
import { User } from '@moteur/types/User.js';

export async function formSelectPrompt(user: User, projectId: string): Promise<string | null> {
    const forms = await listForms(user, projectId);
    if (forms.length === 0) {
        console.log('❌ No forms in this project. Create a form first.');
        return null;
    }

    const { selectedForm } = await inquirer.prompt({
        type: 'list',
        name: 'selectedForm',
        message: 'Select a form:',
        choices: forms.map(f => ({ name: `${f.label} (${f.id})`, value: f.id }))
    });

    return selectedForm;
}
