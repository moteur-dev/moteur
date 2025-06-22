import fs from 'fs';
import path from 'path';
import { Layout } from '@moteur/types/Layout';
import { readJson, writeJson } from './utils/fileUtils';
import { htmlRenderer } from './renderers/html/htmlBlockRenderer';
import { validateLayout } from './validators/validateLayout';
import { User } from '@moteur/types/User';
import { isValidId } from './utils/idUtils.js';
import { assertUserCanAccessProject } from './utils/access.js';
import { getProject } from './projects.js';
import { baseLayoutsDir, layoutFilePath, trashLayoutDir } from './utils/pathUtils';

const rendererMap: Record<string, any> = {
    html: htmlRenderer
};

export function listLayouts(user: User, project: string): Layout[] {
    const dir = baseLayoutsDir(project);
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
    const file = layoutFilePath(project, id);
    return readJson(file);
}

export function hasLayout(project: string, id: string): boolean {
    const file = layoutFilePath(project, id);
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
    if (hasLayout(projectId, layout.id)) {
        throw new Error(`Layout with ID "${layout.id}" already exists in project "${projectId}"`);
    }   
    const file = layoutFilePath(projectId, layout.id);
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

    const file = layoutFilePath(projectId, id);
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
    const source = layoutFilePath(project, id);
    const destDir = trashLayoutDir(project, id);
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
