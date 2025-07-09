// src/cli/menu/entriesMenu.ts
import inquirer from 'inquirer';
import {
    listEntriesCommand,
    createEntryCommand,
    patchEntryCommand,
    deleteEntryCommand
} from '../commands/entries';

export async function showEntriesMenu(projectId: string, modelId: string) {
    try {
        console.clear();
        console.log(`\n📦 Entries for Model: ${modelId} in Project: ${projectId}`);

        const { entryAction } = await inquirer.prompt([
            {
                type: 'list',
                name: 'entryAction',
                message: `Choose an action for entries of "${modelId}":`,
                choices: [
                    { name: '📂 List entries', value: 'list' },
                    { name: '➕ Create entry', value: 'create' },
                    { name: '🔧 Edit entry', value: 'edit' },
                    { name: '🗑️ Delete entry', value: 'delete' },
                    new inquirer.Separator(),
                    { name: '⬅️ Back to model schemas', value: 'back' }
                ]
            }
        ]);

        switch (entryAction) {
            case 'list':
                await listEntriesCommand({ projectId, model: modelId });
                break;
            case 'create':
                await createEntryCommand({ projectId, model: modelId });
                break;
            case 'edit': {
                const { entryId } = await inquirer.prompt({
                    type: 'input',
                    name: 'entryId',
                    message: 'Enter the entry ID to edit:'
                });
                await patchEntryCommand({ projectId, model: modelId, id: entryId });
                break;
            }
            case 'delete': {
                const { entryId } = await inquirer.prompt({
                    type: 'input',
                    name: 'entryId',
                    message: 'Enter the entry ID to delete:'
                });
                await deleteEntryCommand({ projectId, model: modelId, id: entryId });
                break;
            }
            case 'back':
                return;
        }

        await inquirer.prompt([
            { type: 'input', name: 'continue', message: 'Press Enter to continue...' }
        ]);
        await showEntriesMenu(projectId, modelId);
    } catch (err) {
        if (err instanceof Error && err.name === 'ExitPromptError') {
            console.log('\n👋 Goodbye!'); // noop; silence this error
        } else {
            console.error('\n❌ Error:', err);
        }
        process.exit(1);
    }
}
