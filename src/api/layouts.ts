import fs from 'fs';
import path from 'path';
import { moteurConfig } from '../../moteur.config';
import { Layout } from '../types/Layout';
import { readJson, writeJson } from '../utils/fileUtils';
import { htmlRenderer } from '../renderers/html/htmlBlockRenderer';
import { validateLayout } from '../validators/validateLayout';
import { User } from '../types/User';
import { isValidId } from '../utils/idUtils.js';
import { assertUserCanAccessProject } from '../utils/access.js';
import { getProject } from './projects.js';

const rendererMap: Record<string, any> = {
    html: htmlRenderer
};

export function listLayouts(user: User, project: string): Layout[] {
    const projectRoot = moteurConfig.projectRoot || 'data/projects';
    const dir = path.resolve(`${projectRoot}/${project}/layouts`);
    if (!fs.existsSync(dir)) return [];

    return fs
        .readdirSync(dir)
        .filter(f => f.endsWith('on'))
        .map(f => {
            const filePath = path.join(dir, f);
            try {
                const raw = fs.readFileSync(filePath, 'utf-8');
                const layout = JSON.parse(raw) as Layout;
                return layout;
            } catch (err) {
                console.warn(`[Moteur] Failed to load layout ${f}`, err);
                return null;
            }
        })
        .filter((l): l is Layout => l !== null);
}

export function getLayout(user: User, project: string, id: string): Layout {
    const file = getLayoutFilePath(project, id);
    return readJson(file);
}

export function hasLayout(project: string, id: string): boolean {
    const file = getLayoutFilePath(project, id);
    return fs.existsSync(file);
}

export function createLayout(user: User, projectId: string, layout: Layout): Layout {
    const project = getProject(user, projectId);
    assertUserCanAccessProject(user, project);

    if (!layout.id || !isValidId(layout.id)) {
        throw new Error(`Invalid layout ID: "${layout.id}"`);
    }

    const result = validateLayout(layout);
    if (result.issues.length > 0) {
        throw new Error(
            `Layout validation failed: ${result.issues.map(issue => issue.message).join(', ')}`
        );
    }

    getLayoutDir(projectId); // This method creates the directory if it doesn't exist
    const file = getLayoutFilePath(projectId, layout.id);
    if (fs.existsSync(file)) {
        throw new Error(`Layout ${layout.id} already exists`);
    }
    writeJson(file, layout);
    return layout;
}

export function updateLayout(
    user: User,
    projectId: string,
    id: string,
    patch: Partial<Layout>
): Layout {
    const project = getProject(user, projectId);
    assertUserCanAccessProject(user, project);

    if (!id || !isValidId(id)) {
        throw new Error(`Invalid layout ID: ${id}`);
    }

    const file = getLayoutFilePath(projectId, id);
    if (!fs.existsSync(file)) {
        throw new Error(`Layout ${id} does not exist in project ${projectId}`);
    }
    try {
        const current = readJson(file);
        const updated = { ...current, ...patch };
        updated.meta.audit.revision = (current.meta?.audit?.revision || 0) + 1;
        writeJson(file, updated);
        return updated;
    } catch (error) {
        throw new Error(`Failed to read or update layout ${id} in project ${projectId}: ${error}`);
    }
}

export function deleteLayout(user: User, project: string, id: string): void {
    const source = getLayoutFilePath(project, id);
    const destDir = getTrashDir(project);
    const dest = path.join(destDir, `${id}.json`);

    if (!fs.existsSync(source)) throw new Error('Layout not found');

    fs.mkdirSync(destDir, { recursive: true });
    fs.renameSync(source, dest);
}

export function renderLayout(
    user: User,
    layout: Layout,
    format: string = 'html',
    options: Record<string, any> = {}
): string {
    const renderer = rendererMap[format];

    if (!renderer || typeof renderer.renderLayout !== 'function') {
        throw new Error(`Unsupported renderer format: "${format}"`);
    }

    return renderer.renderLayout(layout, options);
}

function getLayoutFilePath(project: string, id: string): string {
    return path.join(moteurConfig.projectRoot, project, 'layouts', `${id}.json`);
}

function getLayoutDir(project: string): string {
    const dir = path.join(moteurConfig.projectRoot, project, 'layouts');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
}

function getTrashDir(project: string): string {
    const trashDir = path.join(moteurConfig.projectRoot, project, '.trash', 'layouts');
    if (!fs.existsSync(trashDir)) {
        fs.mkdirSync(trashDir, { recursive: true });
    }
    return trashDir;
}
