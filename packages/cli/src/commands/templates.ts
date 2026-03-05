import {
    listTemplates,
    getTemplateWithAuth as getTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    validateTemplateById
} from '@moteur/core/templates.js';
import { projectSelectPrompt } from '../utils/projectSelectPrompt.js';
import { resolveInputData } from '../utils/resolveInputData.js';
import type { TemplateSchema } from '@moteur/types/Template.js';
import { cliLoadUser } from '../utils/auth.js';
import { User } from '@moteur/types/User.js';
import { cliRegistry } from '@moteur/core/registry/CommandRegistry.js';

export async function listTemplatesCommand(args: {
    projectId?: string;
    json?: boolean;
    quiet?: boolean;
}) {
    const user: User = cliLoadUser();
    if (!args.projectId) {
        args.projectId = await projectSelectPrompt(user);
    }
    const templates = await listTemplates(args.projectId as string);
    if (templates.length === 0) {
        if (!args.quiet) console.log(`📂 No templates found in project "${args.projectId}".`);
        return;
    }
    if (args.json) return console.log(JSON.stringify(templates, null, 2));
    if (!args.quiet) {
        console.log(`📁 Templates in project "${args.projectId}":`);
        templates.forEach(t => console.log(`- ${t.id} (${t.label})`));
    }
}

export async function getTemplateCommand(args: {
    projectId?: string;
    id?: string;
    json?: boolean;
    quiet?: boolean;
}) {
    const user: User = cliLoadUser();
    const template = await getTemplate(user, args.projectId as string, args.id as string);
    if (args.json) return console.log(JSON.stringify(template, null, 2));
    if (!args.quiet) {
        console.log(`📁 Template "${args.id}":`);
        console.log(template);
    }
}

export async function createTemplateCommand(args: {
    projectId?: string;
    file?: string;
    data?: string;
    quiet?: boolean;
    json?: boolean;
}) {
    const user: User = cliLoadUser();
    if (!args.projectId) args.projectId = await projectSelectPrompt(user);
    const patch = await resolveInputData({
        file: args.file,
        data: args.data,
        interactiveFields: ['id', 'label', 'description']
    });
    const data: Omit<TemplateSchema, 'createdAt' | 'updatedAt'> = {
        ...patch,
        projectId: args.projectId as string,
        id: (patch.id ??
            patch.label?.toString().toLowerCase().replace(/\s+/g, '-') ??
            'template') as string,
        label: (patch.label ?? 'Untitled') as string,
        description: patch.description,
        fields: (patch.fields ?? {}) as TemplateSchema['fields']
    };
    const created = await createTemplate(args.projectId as string, user, data);
    if (args.json) return console.log(JSON.stringify(created, null, 2));
    if (!args.quiet)
        console.log(`✅ Created template "${created.id}" in project "${args.projectId}".`);
    return created;
}

export async function patchTemplateCommand(args: {
    projectId?: string;
    id?: string;
    file?: string;
    data?: string;
    quiet?: boolean;
    json?: boolean;
}) {
    const user: User = cliLoadUser();
    if (!args.projectId) args.projectId = await projectSelectPrompt(user);
    const patch = await resolveInputData({
        file: args.file,
        data: args.data,
        interactiveFields: ['label', 'description']
    });
    const updated = await updateTemplate(args.projectId as string, user, args.id as string, patch);
    if (!args.quiet)
        console.log(`🔧 Patched template "${args.id}" in project "${args.projectId}".`);
    if (args.json) return console.log(JSON.stringify(updated, null, 2));
    return updated;
}

export async function deleteTemplateCommand(args: {
    projectId?: string;
    id?: string;
    quiet?: boolean;
}) {
    const user: User = cliLoadUser();
    await deleteTemplate(args.projectId as string, user, args.id as string);
    if (!args.quiet) {
        console.log(`🗑️ Moved template "${args.id}" to trash in project "${args.projectId}".`);
    }
}

export async function validateTemplateCommand(args: {
    projectId?: string;
    id?: string;
    json?: boolean;
    quiet?: boolean;
}) {
    const user: User = cliLoadUser();
    if (!args.projectId) args.projectId = await projectSelectPrompt(user);
    if (args.id) {
        const result = await validateTemplateById(args.projectId as string, args.id);
        if (!args.quiet) {
            if (result.valid) console.log('✅ Template is valid.');
            else result.issues.forEach(i => console.log(`- ${i.path}: ${i.message}`));
        }
        if (args.json) console.log(JSON.stringify(result, null, 2));
        return result;
    }
    const templates = await listTemplates(args.projectId as string);
    const results = await Promise.all(
        templates.map(t => validateTemplateById(args.projectId as string, t.id))
    );
    if (!args.quiet) {
        const invalid = results.filter(r => !r.valid);
        if (invalid.length === 0) console.log('✅ All templates are valid.');
        else
            invalid.forEach(r =>
                r.issues.forEach(issue => console.log(`- ${issue.path}: ${issue.message}`))
            );
    }
    if (args.json) console.log(JSON.stringify(results, null, 2));
    return results;
}

cliRegistry.register('templates', {
    name: 'list',
    description: 'List all templates',
    action: listTemplatesCommand
});
cliRegistry.register('templates', {
    name: 'get',
    description: 'Get a single template',
    action: getTemplateCommand
});
cliRegistry.register('templates', {
    name: 'create',
    description: 'Create a new template',
    action: createTemplateCommand
});
cliRegistry.register('templates', {
    name: 'patch',
    description: 'Update an existing template',
    action: patchTemplateCommand
});
cliRegistry.register('templates', {
    name: 'delete',
    description: 'Delete a template',
    action: deleteTemplateCommand
});
cliRegistry.register('templates', {
    name: 'validate',
    description: 'Validate template(s)',
    action: validateTemplateCommand
});
