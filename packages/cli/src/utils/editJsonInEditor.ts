import inquirer from 'inquirer';

/**
 * Opens an inquirer editor prompt to edit JSON directly.
 * @param currentData - The JSON object to edit.
 * @param context - A label for what you're editing (e.g., "ModelSchema", "Field").
 * @returns The parsed JSON object if valid, or null if user aborts.
 */
export async function editJsonInEditor(currentData: any, context = 'JSON'): Promise<any | null> {
    try {
        const { editedJson } = await inquirer.prompt({
            type: 'editor',
            name: 'editedJson',
            message: `Editing ${context} (JSON)`,
            default: JSON.stringify(currentData, null, 2)
        });

        // Validate the result
        if (editedJson.trim() === '') {
            console.log('✏️ Edit cancelled or empty. No changes applied.');
            return null;
        }

        const parsed = JSON.parse(editedJson);
        return parsed;
    } catch (error) {
        console.error(
            '❌ Invalid JSON or editor error:',
            error instanceof Error ? error.message : 'Unknown error'
        );
        return null;
    }
}
