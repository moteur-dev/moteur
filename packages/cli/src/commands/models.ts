import inquirer from 'inquirer';
import {
    listModelSchemas,
    getModelSchema,
    createModelSchema,
    updateModelSchema,
    deleteModelSchema
} from '@moteur/core/models.js';
import { renderCliField } from '../field-renderers/renderCliField.js';
import '../field-renderers/index.js';
import { editModelSchemaFields } from '../utils/editModelSchemaFields.js';
import { projectSelectPrompt } from '../utils/projectSelectPrompt.js';
import { resolveInputData } from '../utils/resolveInputData.js';
import { ModelSchema, modelSchemaFields } from '@moteur/types/Model.js';
import { cliLoadUser } from '../utils/auth.js';
import { User } from '@moteur/types/User.js';
import { cliRegistry } from '@moteur/core/registry/CommandRegistry.js';
import { showModelSchemasMenu } from '../menu/modelsMenu.js';

export async function listModelSchemasCommand(args: {
    projectId?: string;
    json?: boolean;
    quiet?: boolean;
}) {
    const user: User = cliLoadUser();
    if (!args.projectId) {
        args.projectId = await projectSelectPrompt(user);
    }
    const models = listModelSchemas(user, args.projectId as string);
    if (models.length === 0) {
        if (!args.quiet) console.log(`📂 No model schemas found in project "${args.projectId}".`);
        return;
    }
    if (args.json) {
        return console.log(JSON.stringify(models, null, 2));
    }
    if (!args.quiet) {
        console.log(`📁 Model Schemas in project "${args.projectId}":`);
        models.forEach(m => console.log(`- ${m.id} (${m.label})`));
    }
}

export async function getModelSchemaCommand(args: {
    projectId?: string;
    id?: string;
    json?: boolean;
    quiet?: boolean;
}) {
    const user: User = cliLoadUser();
    const model = getModelSchema(user, args.projectId as string, args.id as string);
    if (args.json) {
        return console.log(JSON.stringify(model, null, 2));
    }
    if (!args.quiet) {
        console.log(`📁 Model Schema "${args.id}":`);
        console.log(model);
    }
}

export async function createModelSchemaCommand(args: {
    projectId?: string;
    file?: string;
    data?: string;
    quiet?: boolean;
    json?: boolean;
}) {
    const user: User = cliLoadUser();
    if (!args.projectId) {
        args.projectId = await projectSelectPrompt(user);
    }
    let model: Partial<ModelSchema> = {};

    const nonInteractiveMode = !!(args.file || args.data);
    if (nonInteractiveMode) {
        model = await resolveInputData({
            file: args.file,
            data: args.data,
            interactiveFields: []
        });
    } else {
        console.log('Please provide the model schema details interactively:');
        //console.log('You may exit with Ctrl+C and enter --file=data.json or --data=\'{"key": "value"}\' to provide data directly.');
        for (const key of Object.keys(modelSchemaFields) as (keyof ModelSchema)[]) {
            const fieldSchema = modelSchemaFields[key];
            const value = await renderCliField(fieldSchema.type, fieldSchema);
            model[key] = value;
        }
    }

    // Empty structures for fields & optionsSchema
    model.fields = {};
    model.optionsSchema = {};

    const created = createModelSchema(user, args.projectId as string, model as ModelSchema);
    if (args.json) {
        return console.log(JSON.stringify(created, null, 2));
    }
    if (!args.quiet) {
        console.log(`✅ Created model schema "${created.id}" in project "${args.projectId}".`);
    }

    if (!nonInteractiveMode) {
        const { editFields } = await inquirer.prompt({
            type: 'confirm',
            name: 'editFields',
            message: 'Would you like to add/edit fields now?',
            default: true
        });

        if (editFields) {
            await editModelSchemaFields(user, args.projectId as string, created.id as string);
        }
    }

    return created;
}

export async function patchModelSchemaCommand(args: {
    projectId?: string;
    id?: string;
    file?: string;
    data?: string;
    quiet?: boolean;
    json?: boolean;
}) {
    const user: User = cliLoadUser();
    if (!args.projectId) {
        args.projectId = await projectSelectPrompt(user);
    }
    const patch = await resolveInputData({
        file: args.file,
        data: args.data,
        interactiveFields: ['label', 'description', 'modelType']
    });

    const updated = updateModelSchema(user, args.projectId as string, args.id as string, patch);
    if (!args.quiet) {
        console.log(`🔧 Patched model schema "${args.id}" in project "${args.projectId}".`);
    }
    if (args.json) return console.log(JSON.stringify(updated, null, 2));

    return updated;
}

export async function deleteModelSchemaCommand(args: {
    projectId?: string;
    id?: string;
    quiet?: boolean;
}) {
    const user: User = cliLoadUser();
    deleteModelSchema(user, args.projectId as string, args.id as string);
    if (!args.quiet) {
        console.log(`🗑️ Moved model schema "${args.id}" to trash in project "${args.projectId}".`);
    }
}

cliRegistry.register('models', {
    name: '',
    description: 'Interactive models menu',
    action: async (opts: { projectId?: string }) => {
        const user = cliLoadUser();
        const projectId = opts.projectId ?? (await projectSelectPrompt(user));
        await showModelSchemasMenu(projectId);
    }
});

cliRegistry.register('models', {
    name: 'list',
    description: 'List all model schemas',
    action: listModelSchemasCommand
});

cliRegistry.register('models', {
    name: 'get',
    description: 'Get a single model schema',
    action: getModelSchemaCommand
});

cliRegistry.register('models', {
    name: 'create',
    description: 'Create a new model schema',
    action: createModelSchemaCommand
});

cliRegistry.register('models', {
    name: 'patch',
    description: 'Update an existing model schema',
    action: patchModelSchemaCommand
});

cliRegistry.register('models', {
    name: 'delete',
    description: 'Delete a model schema',
    action: deleteModelSchemaCommand
});
