import type { StorageAdapter } from '@moteur/types/Storage.js';

const ENCODING = 'utf-8';

export async function getJson<T = unknown>(storage: StorageAdapter, key: string): Promise<T | null> {
    const buf = await storage.get(key);
    if (buf === null) return null;
    const text = buf.toString(ENCODING);
    return JSON.parse(text) as T;
}

export async function putJson(
    storage: StorageAdapter,
    key: string,
    data: unknown
): Promise<void> {
    const text = JSON.stringify(data, null, 2);
    await storage.put(key, Buffer.from(text, ENCODING));
}

export async function hasKey(storage: StorageAdapter, key: string): Promise<boolean> {
    const buf = await storage.get(key);
    return buf !== null;
}

export async function deleteKey(storage: StorageAdapter, key: string): Promise<void> {
    await storage.delete(key);
}
