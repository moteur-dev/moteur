import { randomUUID } from 'crypto';
import type { Notification, NotificationType } from '@moteur/types/Notification.js';
import { getProjectStorage } from './utils/getProjectStorage.js';
import { getJson, putJson } from './utils/storageAdapterUtils.js';
import { NOTIFICATIONS_KEY } from './utils/storageKeys.js';

export async function createNotification(
    projectId: string,
    userId: string,
    data: {
        type: NotificationType;
        reviewId: string;
        entryId: string;
        modelId: string;
    }
): Promise<Notification> {
    try {
        const storage = getProjectStorage(projectId);
        const list = (await getJson<Notification[]>(storage, NOTIFICATIONS_KEY)) ?? [];
        const now = new Date().toISOString();
        const notification: Notification = {
            id: randomUUID(),
            projectId,
            userId,
            type: data.type,
            reviewId: data.reviewId,
            entryId: data.entryId,
            modelId: data.modelId,
            read: false,
            createdAt: now
        };
        list.push(notification);
        await putJson(storage, NOTIFICATIONS_KEY, list);
        return notification;
    } catch {
        throw new Error('Failed to create notification');
    }
}

export async function getNotifications(
    projectId: string,
    userId: string,
    unreadOnly: boolean = true
): Promise<Notification[]> {
    try {
        const storage = getProjectStorage(projectId);
        const list = (await getJson<Notification[]>(storage, NOTIFICATIONS_KEY)) ?? [];
        let out = list.filter(n => n.projectId === projectId && n.userId === userId);
        if (unreadOnly) {
            out = out.filter(n => !n.read);
        }
        out.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return out;
    } catch {
        return [];
    }
}

export async function markRead(
    projectId: string,
    userId: string,
    notificationId: string
): Promise<Notification> {
    try {
        const storage = getProjectStorage(projectId);
        const list = (await getJson<Notification[]>(storage, NOTIFICATIONS_KEY)) ?? [];
        const idx = list.findIndex(
            n => n.id === notificationId && n.projectId === projectId && n.userId === userId
        );
        if (idx === -1) throw new Error('Notification not found');
        const notification = list[idx]!;
        if (notification.read) return notification;
        const updated = { ...notification, read: true };
        list[idx] = updated;
        await putJson(storage, NOTIFICATIONS_KEY, list);
        return updated;
    } catch (err) {
        if (err instanceof Error) throw err;
        throw new Error('Failed to mark notification as read');
    }
}

export async function markAllRead(projectId: string, userId: string): Promise<void> {
    try {
        const storage = getProjectStorage(projectId);
        const list = (await getJson<Notification[]>(storage, NOTIFICATIONS_KEY)) ?? [];
        let changed = false;
        const updated = list.map(n => {
            if (n.projectId === projectId && n.userId === userId && !n.read) {
                changed = true;
                return { ...n, read: true };
            }
            return n;
        });
        if (changed) {
            await putJson(storage, NOTIFICATIONS_KEY, updated);
        }
    } catch {
        // never throw; storage failures are swallowed
    }
}
