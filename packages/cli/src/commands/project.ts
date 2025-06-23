import {
    listProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject
} from '@moteur/core/projects';
import { resolveInputData } from '../utils/resolveInputData';
import { editJsonInEditor } from '../utils/editJsonInEditor';
import { ProjectSchema, projectSchemaFields } from '@moteur/types/Project';
import { renderCliField } from '../field-renderers/renderCliField';
import { projectSelectPrompt } from '../utils/projectSelectPrompt';
import { cliRequireRole, cliLoadUser } from '../utils/auth';
import { User } from '@moteur/types/User';
import { cliRegistry } from '@moteur/core/registry/CommandRegistry';
import { showProjectsMenu } from '../menu/projectsMenu';

export async function listProjectsCommand(args: { json?: boolean; quiet?: boolean }) {
    const user: User = cliLoadUser();
    const projects = listProjects(user);
    if (projects.length === 0) {
        if (!args.quiet) {
            console.log(`📂 No projects found.`);
        }
        return;
    }
    if (args.json) return console.log(JSON.stringify(projects, null, 2));
    if (!args.quiet) {
        console.log(`📁 Projects:`);
        projects.forEach(p => console.log(`- ${p.id} (${p.label})`));
    }
}

export async function getProjectCommand(args: { id?: string; json?: boolean; quiet?: boolean }) {
    const user: User = cliLoadUser();
    if (!args.id) {
        args.id = await projectSelectPrompt(user);
    }
    const project = getProject(user, args.id as string);
    if (args.json) return console.log(JSON.stringify(project, null, 2));
    if (!args.quiet) {
        console.log(`📁 Project "${args.id}":`);
        console.log(project);
    }
}

export async function createProjectCommand(args: {
    file?: string;
    data?: string;
    json?: boolean;
    quiet?: boolean;
}) {
    const user: User = cliLoadUser();
    console.log(user);
    const adminUser = cliRequireRole('admin');
    console.log(`🔑 Authenticated as admin: ${adminUser.email}\n`);

    const nonInteractiveMode = !!(args.file || args.data);
    let project: Partial<ProjectSchema> = {};
    if (nonInteractiveMode) {
        project = await resolveInputData({
            file: args.file,
            data: args.data,
            interactiveFields: []
        });
    } else {
        for (const key of Object.keys(projectSchemaFields) as (keyof ProjectSchema)[]) {
            const fieldSchema = projectSchemaFields[key];
            const value = await renderCliField(fieldSchema.type, fieldSchema);
            project[key] = value;
        }
    }

    const created = createProject(user, project as ProjectSchema);
    if (args.json) {
        return console.log(JSON.stringify(created, null, 2));
    }
    if (!args.quiet) {
        console.log(`✅ Created project`);
    }
    return created;
}

export async function patchProjectCommand(args: {
    id?: string;
    file?: string;
    data?: string;
    json?: boolean;
    quiet?: boolean;
}) {
    const user: User = cliLoadUser();
    const adminUser = cliRequireRole('admin');
    console.log(`🔑 Authenticated as admin: ${adminUser.email}\n`);

    if (!args.id) {
        args.id = await projectSelectPrompt(user);
    }

    let patch: Partial<ProjectSchema> = {};
    const nonInteractiveMode = !!(args.file || args.data);
    if (nonInteractiveMode) {
        patch = await resolveInputData({
            file: args.file,
            data: args.data,
            interactiveFields: ['label']
        });
    } else {
        for (const key of Object.keys(projectSchemaFields) as (keyof ProjectSchema)[]) {
            const fieldSchema = projectSchemaFields[key];
            const value = await renderCliField(fieldSchema.type, fieldSchema);
            patch[key] = value;
        }
    }

    const updated = updateProject(user, args.id as string, patch);
    if (!args.quiet) {
        console.log(`🔧 Patched project "${args.id}"`);
    }
    return updated;
}

export async function patchProjectJSONCommand(args: { projectId?: string; quiet?: boolean }) {
    const user: User = cliLoadUser();
    const project = getProject(user, args.projectId as string);
    const edited = await editJsonInEditor(project, 'Project Settings');

    if (edited) {
        const updated = updateProject(user, args.projectId as string, edited);
        if (!args.quiet) {
            console.log(`✅ Project "${args.projectId}" updated via JSON editor.`);
        }
        return updated;
    } else {
        if (!args.quiet) {
            console.log('❌ Edit cancelled or invalid JSON.');
        }
        return null;
    }
}

export async function deleteProjectCommand(args: { id?: string; quiet?: boolean }) {
    const user: User = cliLoadUser();
    deleteProject(user, args.id as string);
    if (!args.quiet) {
        console.log(`🗑️ Moved project "${args.id}" to trash`);
    }
}

cliRegistry.register('projects', {
    name: '', // default when you run `moteur projects`
    description: 'Interactive projects menu',
    action: async () => {
        await showProjectsMenu();
    }
});

cliRegistry.register('projects', {
    name: 'list',
    description: 'List all projects',
    action: listProjectsCommand
});

cliRegistry.register('projects', {
    name: 'get',
    description: 'Get one project by id',
    action: getProjectCommand
});

cliRegistry.register('projects', {
    name: 'create',
    description: 'Create a new project',
    action: createProjectCommand
});

cliRegistry.register('projects', {
    name: 'patch',
    description: 'Update an existing project',
    action: patchProjectCommand
});

cliRegistry.register('projects', {
    name: 'edit-json',
    description: 'Edit project JSON in your editor',
    action: patchProjectJSONCommand
});

cliRegistry.register('projects', {
    name: 'delete',
    description: 'Delete (trash) a project',
    action: deleteProjectCommand
});
