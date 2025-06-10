import fs from 'fs';
import path from 'path';
import { moteurConfig } from '../../moteur.config.js';
import { ProjectSchema } from '../types/Project.js';
import { loadProjects } from '../loaders/loadProjects.js';
import { isValidId } from '../utils/idUtils.js';
import { readJson, writeJson, isExistingProjectId } from '../utils/fileUtils.js';
import { projectFilePath, projectDir } from '../utils/pathUtils.js';
import { User } from '../types/User.js';
import { assertUserCanAccessProject, assertUserCanCreateProject } from '../utils/access.js';
import { triggerEvent } from '../utils/eventBus.js';

export function getProject(user: User, projectId: string): ProjectSchema {
    if (!isValidId(projectId)) {
        throw new Error(`Invalid projectId: "${projectId}"`);
    }
    if (!isExistingProjectId(projectId)) {
        throw new Error(`Project "${projectId}" not found`);
    }

    const file = projectFilePath(projectId);
    const project: ProjectSchema = readJson(file);
    assertUserCanAccessProject(user, project);
    return project;
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

export function createProject(user: User, project: ProjectSchema): ProjectSchema {
    assertUserCanCreateProject(user);
    if (isExistingProjectId(project.id)) {
        throw new Error(`Project with id "${project.id}" already exists`);
    }

    triggerEvent('project.beforeCreate', { project, user });

    // @todo Move to a plugin
    const dir = projectDir(project.id);
    fs.mkdirSync(path.join(dir, 'layouts'), { recursive: true });
    fs.mkdirSync(path.join(dir, 'structures'), { recursive: true });
    fs.mkdirSync(path.join(dir, 'models'), { recursive: true });

    writeJson(projectFilePath(project.id), project);
    triggerEvent('project.afterCreate', { project, user });
    return project;
}

export function updateProject(
    user: User,
    projectId: string,
    patch: Partial<ProjectSchema>
): ProjectSchema {
    const current = getProject(user, projectId);
    const updated = { ...current, ...patch };
    triggerEvent('project.beforeUpdate', { project: updated, user });

    writeJson(projectFilePath(projectId), updated);
    triggerEvent('project.afterUpdate', { project: updated, user });
    return updated;
}

export function deleteProject(user: User, projectId: string): void {
    const project = getProject(user, projectId);

    triggerEvent('project.beforeDelete', { project, user });

    const base = moteurConfig.projectRoot;
    const source = path.join(base, projectId);
    const destDir = path.join(base, '.trash', 'projects');
    const dest = path.join(destDir, projectId);

    fs.mkdirSync(destDir, { recursive: true });
    fs.renameSync(source, dest);

    triggerEvent('project.afterDelete', { project, user });
}
