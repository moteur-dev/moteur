import { randomUUID } from 'crypto';
import type { ApiCollection, ApiCollectionResource } from '@moteur/types/ApiCollection.js';
import type { User } from '@moteur/types/User.js';
import { getProject } from './projects.js';
import { getProjectStorage } from './utils/getProjectStorage.js';
import { getJson, putJson } from './utils/storageAdapterUtils.js';
import { API_COLLECTIONS_KEY } from './utils/storageKeys.js';

async function loadCollections(projectId: string): Promise<ApiCollection[]> {
    const storage = getProjectStorage(projectId);
    const list = (await getJson<ApiCollection[]>(storage, API_COLLECTIONS_KEY)) ?? [];
    return list;
}

async function saveCollections(projectId: string, list: ApiCollection[]): Promise<void> {
    const storage = getProjectStorage(projectId);
    await putJson(storage, API_COLLECTIONS_KEY, list);
}

export async function listCollections(projectId: string): Promise<ApiCollection[]> {
    const list = await loadCollections(projectId);
    return list;
}

export async function getCollection(projectId: string, id: string): Promise<ApiCollection | null> {
    const list = await loadCollections(projectId);
    return list.find(c => c.id === id) ?? null;
}

export async function createCollection(
    projectId: string,
    user: User,
    data: { label: string; description?: string; resources?: ApiCollectionResource[] }
): Promise<ApiCollection> {
    await getProject(user, projectId);
    const list = await loadCollections(projectId);
    const now = new Date().toISOString();
    const collection: ApiCollection = {
        id: randomUUID(),
        projectId,
        label: data.label,
        description: data.description,
        resources: data.resources ?? [],
        createdAt: now,
        updatedAt: now
    };
    list.push(collection);
    await saveCollections(projectId, list);
    return collection;
}

export async function updateCollection(
    projectId: string,
    user: User,
    id: string,
    patch: Partial<Pick<ApiCollection, 'label' | 'description' | 'resources'>>
): Promise<ApiCollection> {
    await getProject(user, projectId);
    const list = await loadCollections(projectId);
    const idx = list.findIndex(c => c.id === id);
    if (idx === -1) throw new Error(`Collection "${id}" not found`);
    const now = new Date().toISOString();
    const updated: ApiCollection = {
        ...list[idx],
        ...patch,
        updatedAt: now
    };
    list[idx] = updated;
    await saveCollections(projectId, list);
    return updated;
}

export async function deleteCollection(projectId: string, user: User, id: string): Promise<void> {
    await getProject(user, projectId);
    const list = await loadCollections(projectId);
    const filtered = list.filter(c => c.id !== id);
    if (filtered.length === list.length) throw new Error(`Collection "${id}" not found`);
    await saveCollections(projectId, filtered);
}
