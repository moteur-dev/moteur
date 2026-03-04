import fs from 'fs';
import path from 'path';
import { ProjectSchema } from '@moteur/types/Project.js';
import { User } from '@moteur/types/User.js';
import { ValidationResult } from '@moteur/types/ValidationResult.js';
import { isValidId } from './utils/idUtils.js';
import { isExistingProjectId } from './utils/fileUtils.js';
import { projectDir, baseProjectsDir } from './utils/pathUtils.js';
import { assertUserCanAccessProject, assertUserCanCreateProject } from './utils/access.js';
import { triggerEvent } from './utils/eventBus.js';
import { validateProject } from './validators/validateProject.js';
import { getProjectStorage } from './utils/getProjectStorage.js';
import { storageRegistry } from './registry/StorageRegistry.js';
import { getJson, putJson } from './utils/storageAdapterUtils.js';
import { PROJECT_KEY } from './utils/storageKeys.js';
import type { LocalStorageOptions } from '@moteur/types/Storage.js';
import { removeProjectFromAllUsers, addProjectToUser } from './users.js';

export function loadProjects(): ProjectSchema[] {
    const root = baseProjectsDir();

    if (!fs.existsSync(root)) return [];

    return fs
        .readdirSync(root)
        .filter(dir => {
            const fullPath = path.join(root, dir, 'project.json');
            return fs.existsSync(fullPath);
        })
        .map(dir => {
            const configPath = path.join(root, dir, 'project.json');
            try {
                const raw = fs.readFileSync(configPath, 'utf-8');
                const schema = JSON.parse(raw) as ProjectSchema;
                return { ...schema, id: dir };
            } catch (err) {
                console.error(`[Moteur] Failed to load project config for "${dir}"`, err);
                return null;
            }
        })
        .filter((p): p is ProjectSchema => p !== null);
}

export async function getProject(user: User, projectId: string): Promise<ProjectSchema> {
    if (!isValidId(projectId)) {
        throw new Error(`Invalid projectId: "${projectId}"`);
    }
    if (!isExistingProjectId(projectId)) {
        throw new Error(`Project "${projectId}" not found`);
    }

    const storage = getProjectStorage(projectId);
    const project = await getJson<ProjectSchema>(storage, PROJECT_KEY);
    if (!project || !project.id) {
        throw new Error(`Project "${projectId}" not found`);
    }
    assertUserCanAccessProject(user, { ...project, id: projectId });
    return { ...project, id: projectId };
}

export function listProjects(user: User): ProjectSchema[] {
    return loadProjects().filter(project => {
        try {
            assertUserCanAccessProject(user, project);
            return true;
        } catch {
            return false;
        }
    });
}

export async function createProject(
    user: User,
    project: ProjectSchema
): Promise<{ project?: ProjectSchema; validation?: ValidationResult }> {
    assertUserCanCreateProject(user);
    if (!project || !project.id || !isValidId(project.id)) {
        throw new Error(`Invalid project schema: "${JSON.stringify(project)}"`);
    }
    if (isExistingProjectId(project.id)) {
        throw new Error(`Project with id "${project.id}" already exists`);
    }

    const validationErrors = validateProject(project);
    if (validationErrors.issues.length > 0) {
        return { validation: validationErrors };
    }

    // Assign the creating user to the project if not already
    const projectWithUsers = { ...project };
    if (!projectWithUsers.users?.length) {
        projectWithUsers.users = [user.id];
    } else if (!projectWithUsers.users.includes(user.id)) {
        projectWithUsers.users = [...projectWithUsers.users, user.id];
    }

    triggerEvent('project.beforeCreate', { project: projectWithUsers, user });

    const options: LocalStorageOptions = {
        baseDir: projectDir(projectWithUsers.id),
        listMode: 'directory'
    };
    const storage = storageRegistry.create('local', options);
    await putJson(storage, PROJECT_KEY, projectWithUsers);

    addProjectToUser(user.id, projectWithUsers.id);

    triggerEvent('project.afterCreate', { project: projectWithUsers, user });
    return { project: projectWithUsers };
}

export async function updateProject(
    user: User,
    projectId: string,
    patch: Partial<ProjectSchema>
): Promise<ProjectSchema> {
    const current = await getProject(user, projectId);
    const updated = { ...current, ...patch };
    triggerEvent('project.beforeUpdate', { project: updated, user });

    const storage = getProjectStorage(projectId);
    await putJson(storage, PROJECT_KEY, updated);
    triggerEvent('project.afterUpdate', { project: updated, user });
    return updated;
}

export async function deleteProject(user: User, projectId: string): Promise<void> {
    const project = await getProject(user, projectId);

    triggerEvent('project.beforeDelete', { project, user });

    const base = baseProjectsDir();
    const source = path.join(base, projectId);
    const destDir = path.join(base, '.trash', 'projects');
    const dest = path.join(destDir, projectId);

    fs.mkdirSync(destDir, { recursive: true });
    fs.renameSync(source, dest);

    removeProjectFromAllUsers(projectId);

    triggerEvent('project.afterDelete', { project, user });
}
