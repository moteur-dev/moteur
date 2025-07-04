import inquirer from 'inquirer';
import {
    listEntries,
    getEntry,
    createEntry,
    updateEntry,
    deleteEntry
} from '@moteur/core/entries.js';
import { getModelSchema } from '@moteur/core/models.js';
import { resolveInputData } from '../utils/resolveInputData.js';
import { editJsonInEditor } from '../utils/editJsonInEditor.js';
import { projectSelectPrompt } from '../utils/projectSelectPrompt.js';
import { renderCliField } from '../field-renderers/renderCliField.js';
import { Entry } from '@moteur/types/Model.js';
import { modelSelectPrompt } from '../utils/modelSelectPrompt.js';
import { entrySelectPrompt } from '../utils/entrySelectPrompt.js';
import { validateEntry } from '@moteur/core/validators/validateEntry.js';
import { ValidationResult } from '@moteur/types/ValidationResult.js';
import { cliLoadUser } from '../utils/auth.js';
import { User } from '@moteur/types/User.js';
import { cliRegistry } from '@moteur/core/registry/CommandRegistry.js';
import { showEntriesMenu } from '../menu/entriesMenu.js';

export async function listEntriesCommand(args: {
    projectId?: string;
    model?: string;
    json?: boolean;
    quiet?: boolean;
}) {
    const user: User = cliLoadUser();
    const entries = listEntries(user, args.projectId as string, args.model as string);
    if (entries.length === 0) {
        if (!args.quiet) {
            console.log('📂 No entries found for this model.');
        }
        return;
    }
    if (args.json) return console.log(JSON.stringify(entries, null, 2));
    if (!args.quiet) {
        console.log(`📁 Entries for model "${args.model}" in project "${args.projectId}":`);
        entries.forEach(e => console.log(`- ${e.id}`));
    }
}

export async function getEntryCommand(args: {
    projectId?: string;
    model?: string;
    id?: string;
    json?: boolean;
    quiet?: boolean;
}) {
    const user: User = cliLoadUser();
    const entry = getEntry(user, args.projectId as string, args.model as string, args.id as string);
    if (args.json) return console.log(JSON.stringify(entry, null, 2));
    if (!args.quiet) {
        console.log(`📁 Entry "${args.id}" in model "${args.model}":`);
        console.log(entry);
    }
}

export async function createEntryCommand(args: {
    projectId?: string;
    model?: string;
    file?: string;
    data?: string;
    quiet?: boolean;
}) {
    const user: User = cliLoadUser();
    if (!args.projectId) {
        args.projectId = await projectSelectPrompt(user);
    }
    if (!args.model) {
        args.model = await modelSelectPrompt(user, args.projectId as string);
    }
    if (!args.projectId || !args.model) {
        console.error('❌ Project ID and model are required to create an entry.');
        return;
    }

    const modelSchema = getModelSchema(user, args.projectId as string, args.model as string);

    const { editMode } = await inquirer.prompt({
        type: 'list',
        name: 'editMode',
        message: 'How would you like to create the entry?',
        choices: [
            { name: '📝 Interactive prompts', value: 'interactive' },
            { name: '🗂️  JSON editor', value: 'json' }
        ]
    });

    let entry: Partial<Entry> = {
        type: args.model,
        data: {},
        meta: {},
        options: {}
    };

    if (editMode === 'json') {
        // Generate skeleton based on model schema
        const skeletonEntry: Partial<Entry> = {
            id: '',
            type: args.model,
            data: Object.keys(modelSchema.fields).reduce(
                (acc, key) => {
                    acc[key] = null; // or sensible defaults
                    return acc;
                },
                {} as Record<string, any>
            ),
            meta: {},
            options: {}
        };

        const edited = await editJsonInEditor(skeletonEntry, 'New Entry JSON');

        if (!edited) {
            console.log('❌ Entry creation cancelled.');
            return;
        }
        entry = edited;
    } else {
        // Interactive field-by-field entry
        const { entryId } = await inquirer.prompt({
            type: 'input',
            name: 'entryId',
            message: 'Enter entry ID:',
            validate: input => input.trim() !== '' || 'Entry ID cannot be empty.'
        });

        entry.id = entryId;
        entry.data = entry.data || {};

        // Fill in each field interactively
        for (const [key, fieldSchema] of Object.entries(modelSchema.fields)) {
            console.log(`\n🖊️ Field: ${key} (${fieldSchema.type})`);
            entry.data[key] = await renderCliField(fieldSchema.type, fieldSchema);
        }
    }

    // Create the entry in the store
    const created = createEntry(user, args.projectId, args.model, entry as Entry);
    if (!args.quiet) {
        console.log(
            `✅ Created entry "${created.id}" in model "${args.model}" and project "${args.projectId}".`
        );
    }
    return created;
}

export async function patchEntryCommand(args: {
    projectId?: string;
    model?: string;
    id?: string;
    file?: string;
    data?: string;
    quiet?: boolean;
}) {
    const user: User = cliLoadUser();
    if (!args.projectId) {
        args.projectId = await projectSelectPrompt(user);
    }
    if (!args.model) {
        args.model = await modelSelectPrompt(user, args.projectId as string);
    }
    if (!args.projectId || !args.model) {
        console.error('❌ Project ID and model are required to create an entry.');
        return;
    }
    if (!args.id) {
        console.error('❌ Entry ID is required to patch an entry.');
        return;
    }

    const entry = getEntry(user, args.projectId, args.model, args.id);

    if (args.file || args.data) {
        const patch = await resolveInputData({
            file: args.file,
            data: args.data,
            interactiveFields: []
        });
        const updated = updateEntry(user, args.projectId, args.model, args.id, patch);
        if (!args.quiet) {
            console.log(
                `🔧 Patched entry "${args.id}" in model "${args.model}" and project "${args.projectId}".`
            );
        }
        return updated;
    }

    // Interactive mode: load model schema
    const schema = getModelSchema(user, args.projectId, args.model);
    const patch: Partial<Entry> = {};
    patch.data = entry.data || {};

    console.log('\n⚙️  Edit fields for the entry (press enter to keep existing values):\n');

    for (const [key, fieldSchema] of Object.entries(schema.fields)) {
        const currentValue = entry.data[key];
        const value = await renderCliField(fieldSchema.type, fieldSchema, currentValue);
        patch.data[key] = value;
    }

    const updated = updateEntry(user, args.projectId, args.model, args.id, patch);
    if (!args.quiet) {
        console.log(
            `🔧 Patched entry "${args.id}" in model "${args.model}" and project "${args.projectId}".`
        );
    }
    return updated;
}

export async function deleteEntryCommand(args: {
    projectId?: string;
    model?: string;
    id?: string;
    quiet?: boolean;
}) {
    const user: User = cliLoadUser();
    deleteEntry(user, args.projectId as string, args.model as string, args.id as string);
    if (!args.quiet) {
        console.log(
            `🗑️ Moved entry "${args.id}" to trash in model "${args.model}" and project "${args.projectId}".`
        );
    }
}

export async function validateEntryCommand(args: {
    projectId?: string;
    model?: string;
    id?: string;
    json?: boolean;
    quiet?: boolean;
}) {
    const user: User = cliLoadUser();
    if (!args.projectId) {
        args.projectId = await projectSelectPrompt(user);
    }
    if (!args.model) {
        args.model = await modelSelectPrompt(user, args.projectId as string);
    }
    if (!args.id) {
        args.id = await entrySelectPrompt(user, args.projectId as string, args.model as string);
    }
    if (!args.projectId || !args.model || !args.id) {
        console.error('❌ Project ID and model are required to create an entry.');
        return;
    }
    return validateSingleEntry(args);
}

export async function validateAllEntriesCommand(args: {
    projectId?: string;
    model?: string;
    json?: boolean;
    quiet?: boolean;
}) {
    const user: User = cliLoadUser();
    if (!args.projectId) {
        args.projectId = await projectSelectPrompt(user);
    }
    if (!args.model) {
        args.model = await modelSelectPrompt(user, args.projectId as string);
    }
    if (!args.projectId || !args.model) {
        throw new Error('❌ Project ID and model are required to create an entry.');
    }
    return validateAllEntries(args);
}

async function validateSingleEntry(args: {
    projectId?: string;
    model?: string;
    id?: string;
    json?: boolean;
    quiet?: boolean;
}): Promise<ValidationResult> {
    const user: User = cliLoadUser();
    const entry = getEntry(user, args.projectId as string, args.model as string, args.id as string);
    if (!entry) {
        throw new Error(
            `❌ Entry "${args.id}" not found in model "${args.model}" and project "${args.projectId}".`
        );
    }

    const modelSchema = getModelSchema(user, args.projectId as string, args.model as string);
    if (!modelSchema) {
        throw new Error(
            `❌ Model schema "${args.model}" not found in project "${args.projectId}".`
        );
    }

    const validationResult = validateEntry(entry, modelSchema);
    if (validationResult.valid) {
        if (!args.quiet) {
            console.log('✅ Entry is valid!');
        }
    } else {
        console.log('❌ Validation errors:');
        validationResult.issues.forEach(e => {
            console.log(`- ${e.path}: ${e.message}`);
        });
    }

    if (args.json) {
        console.log(JSON.stringify(validationResult, null, 2));
    }

    return validationResult;
}

async function validateAllEntries(args: {
    projectId?: string;
    model?: string;
    json?: boolean;
    quiet?: boolean;
}): Promise<ValidationResult[] | undefined> {
    const user: User = cliLoadUser();
    const modelSchema = getModelSchema(user, args.projectId as string, args.model as string);
    if (!modelSchema) {
        throw new Error(
            `❌ Model schema "${args.model}" not found in project "${args.projectId}".`
        );
    }

    const entries = listEntries(user, args.projectId as string, args.model as string);
    if (entries.length === 0) {
        console.log('📂 No entries found for this model.');
        return;
    }

    const validationResults = await Promise.all(
        entries.map(entry => validateEntry(entry, modelSchema))
    );

    const allValid = validationResults.every(result => result.valid);

    if (allValid) {
        console.log('✅ All entries are valid!');
    }

    if (args.json) {
        console.log(JSON.stringify(validationResults, null, 2));
    }
    return validationResults;
}

cliRegistry.register('entries', {
    name: '',
    description: 'Interactive entries menu',
    action: async (opts: { projectId?: string; model?: string }) => {
        const projectId = opts.projectId;
        const model = opts.model;
        await showEntriesMenu(projectId as string, model as string);
    }
});

// entries list
cliRegistry.register('entries', {
    name: 'list',
    description: 'List all entries for a model',
    action: listEntriesCommand
});

// entries get
cliRegistry.register('entries', {
    name: 'get',
    description: 'Get a single entry',
    action: getEntryCommand
});

// entries create
cliRegistry.register('entries', {
    name: 'create',
    description: 'Create a new entry',
    action: createEntryCommand
});

// entries patch
cliRegistry.register('entries', {
    name: 'patch',
    description: 'Update an existing entry',
    action: patchEntryCommand
});

// entries delete
cliRegistry.register('entries', {
    name: 'delete',
    description: 'Delete an entry',
    action: deleteEntryCommand
});

// entries validate (single)
cliRegistry.register('entries', {
    name: 'validate',
    description: 'Validate an entry or all entries',
    action: async opts => {
        if (opts.id) {
            await validateEntryCommand(opts);
        } else {
            await validateAllEntriesCommand(opts);
        }
    }
});
