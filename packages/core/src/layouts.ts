import fs from 'fs';
import path from 'path';
import { Layout } from '@moteur/types/Layout.js';
import { htmlRenderer } from './renderers/html/htmlBlockRenderer.js';
import { validateLayout } from './validators/validateLayout.js';
import { User } from '@moteur/types/User.js';
import { isValidId } from './utils/idUtils.js';
import { assertUserCanAccessProject } from './utils/access.js';
import { getProject } from './projects.js';
import { layoutFilePath, trashLayoutDir } from './utils/pathUtils.js';
import { getProjectStorage } from './utils/getProjectStorage.js';
import { getJson, putJson, hasKey } from './utils/storageAdapterUtils.js';
import { layoutKey, layoutListPrefix } from './utils/storageKeys.js';

const rendererMap: Record<string, any> = {
    html: htmlRenderer
};

export async function listLayouts(user: User, projectId: string): Promise<Layout[]> {
    await getProject(user, projectId);
    const storage = getProjectStorage(projectId);
    const ids = await storage.list(layoutListPrefix());
    const layouts: Layout[] = [];

    for (const id of ids) {
        const layout = await getJson<Layout>(storage, layoutKey(id));
        if (layout) layouts.push(layout);
    }
    return layouts;
}

export async function getLayout(user: User, projectId: string, id: string): Promise<Layout> {
    await getProject(user, projectId);
    const storage = getProjectStorage(projectId);
    const layout = await getJson<Layout>(storage, layoutKey(id));
    if (!layout) {
        throw new Error(`Layout ${id} not found in project ${projectId}`);
    }
    return layout;
}

export async function hasLayout(projectId: string, id: string): Promise<boolean> {
    const storage = getProjectStorage(projectId);
    return hasKey(storage, layoutKey(id));
}

export async function createLayout(user: User, projectId: string, layout: Layout): Promise<Layout> {
    const project = await getProject(user, projectId);
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

    const storage = getProjectStorage(projectId);
    const exists = await hasKey(storage, layoutKey(layout.id));
    if (exists) {
        throw new Error(`Layout with ID "${layout.id}" already exists in project "${projectId}"`);
    }

    await putJson(storage, layoutKey(layout.id), layout);
    return layout;
}

export async function updateLayout(
    user: User,
    projectId: string,
    id: string,
    patch: Partial<Layout>
): Promise<Layout> {
    await getProject(user, projectId);

    if (!id || !isValidId(id)) {
        throw new Error(`Invalid layout ID: ${id}`);
    }

    const storage = getProjectStorage(projectId);
    const current = await getJson<Layout>(storage, layoutKey(id));
    if (!current) {
        throw new Error(`Layout ${id} does not exist in project ${projectId}`);
    }
    const updated = { ...current, ...patch };
    if (updated.meta?.audit) {
        updated.meta.audit.revision = (current.meta?.audit?.revision ?? 0) + 1;
    }
    await putJson(storage, layoutKey(id), updated);
    return updated;
}

export async function deleteLayout(user: User, projectId: string, id: string): Promise<void> {
    await getLayout(user, projectId, id);

    const source = layoutFilePath(projectId, id);
    const destDir = trashLayoutDir(projectId, id);
    const dest = path.join(destDir, `${id}.json`);

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
