import fs from 'fs';
import path from 'path';
import { ProjectSchema } from '@moteur/types/Project';
import { User } from '@moteur/types/User';
import { ValidationResult } from '@moteur/types/ValidationResult';
import { isValidId } from './utils/idUtils';
import { readJson, writeJson, isExistingProjectId } from './utils/fileUtils';
import { projectFilePath, projectDir, baseProjectsDir } from './utils/pathUtils';
import { assertUserCanAccessProject, assertUserCanCreateProject } from './utils/access';
import { triggerEvent } from './utils/eventBus';
import { validateProject } from './validators/validateProject';

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
                return { ...schema, id: dir }; // enforce folder name as ID fallback
            } catch (err) {
                console.error(`[Moteur] Failed to load project config for "${dir}"`, err);
                return null;
            }
        })
        .filter((p): p is ProjectSchema => p !== null);
}

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

export function createProject(
    user: User,
    project: ProjectSchema
): { project?: ProjectSchema; validation?: ValidationResult } {
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

    // Core plugins validate the project schema, assigns the user, add audit info, etc.
    triggerEvent('project.beforeCreate', { project, user });

    // @todo Move to a plugin
    const dir = projectDir(project.id);
    fs.mkdirSync(path.join(dir, 'layouts'), { recursive: true });
    fs.mkdirSync(path.join(dir, 'structures'), { recursive: true });
    fs.mkdirSync(path.join(dir, 'models'), { recursive: true });

    writeJson(projectFilePath(project.id), project);
    triggerEvent('project.afterCreate', { project, user });
    return { project };
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

    const base = baseProjectsDir();
    const source = path.join(base, projectId);
    const destDir = path.join(base, '.trash', 'projects');
    const dest = path.join(destDir, projectId);

    fs.mkdirSync(destDir, { recursive: true });
    fs.renameSync(source, dest);

    triggerEvent('project.afterDelete', { project, user });
}
