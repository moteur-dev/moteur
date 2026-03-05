import { randomUUID } from 'crypto';
import path from 'path';
import fs from 'fs';
import type {
    ActivityEvent,
    ActivityResourceType,
    ActivityAction
} from '@moteur/types/Activity.js';
import type { User } from '@moteur/types/User.js';
import { getProjectStorage } from './utils/getProjectStorage.js';
import { getJson, putJson } from './utils/storageAdapterUtils.js';
import { ACTIVITY_KEY } from './utils/storageKeys.js';
import { triggerEvent } from './utils/eventBus.js';
import { storageConfig } from './config/storageConfig.js';
import { writeJsonAtomic } from './utils/fileUtils.js';

const DEFAULT_PROJECT_LOG_LIMIT = 50;
const MAX_EVENTS_IN_FILE = 10000;

/** Project ID used for global/system activity (users, blueprints). */
export const GLOBAL_PROJECT_ID = '_system';

const GLOBAL_ACTIVITY_FILE = 'activity.json';

function getGlobalActivityPath(): string {
    return path.join(storageConfig.dataRoot, GLOBAL_ACTIVITY_FILE);
}

function systemUser(): User {
    return { id: 'system', name: 'System', isActive: true, email: '', roles: [], projects: [] };
}

function normalizeUser(user: User | undefined): User {
    if (!user?.id) return systemUser();
    return user;
}

function toActivityEvent(
    projectId: string,
    resourceType: ActivityResourceType,
    resourceId: string,
    action: ActivityAction,
    user: User | undefined,
    before?: unknown,
    after?: unknown,
    fieldPath?: string
): ActivityEvent {
    const u = normalizeUser(user);
    return {
        id: randomUUID(),
        projectId,
        resourceType,
        resourceId,
        action,
        userId: u.id,
        userName: u.name ?? u.id,
        ...(fieldPath !== undefined && { fieldPath }),
        ...(before !== undefined && { before }),
        ...(after !== undefined && { after }),
        timestamp: new Date().toISOString()
    };
}

/**
 * Appends an activity event to the project's activity log.
 * Never throws; failures are swallowed so logging cannot break content operations.
 */
export function log(event: ActivityEvent): void {
    try {
        const storage = getProjectStorage(event.projectId);
        getJson<ActivityEvent[]>(storage, ACTIVITY_KEY)
            .then(events => {
                const list = Array.isArray(events) ? events : [];
                const next = [...list, event];
                const trimmed =
                    next.length > MAX_EVENTS_IN_FILE ? next.slice(-MAX_EVENTS_IN_FILE) : next;
                return putJson(storage, ACTIVITY_KEY, trimmed);
            })
            .then(() => {
                triggerEvent('activity.logged', { event });
            })
            .catch(() => {
                // fail silently
            });
    } catch {
        // fail silently
    }
}

/**
 * Returns activity events for a specific resource, newest first.
 * When projectId is GLOBAL_PROJECT_ID, reads from the global activity log.
 */
export async function getLog(
    projectId: string,
    resourceType: ActivityResourceType,
    resourceId: string
): Promise<ActivityEvent[]> {
    try {
        if (projectId === GLOBAL_PROJECT_ID) {
            const events = await getGlobalLog(MAX_EVENTS_IN_FILE);
            return events.filter(
                e => e.resourceType === resourceType && e.resourceId === resourceId
            );
        }
        const storage = getProjectStorage(projectId);
        const events = (await getJson<ActivityEvent[]>(storage, ACTIVITY_KEY)) ?? [];
        const filtered = events.filter(
            e => e.resourceType === resourceType && e.resourceId === resourceId
        );
        return filtered.reverse();
    } catch {
        return [];
    }
}

/**
 * Returns recent activity for the whole project, newest first.
 * When projectId is GLOBAL_PROJECT_ID, returns global (system) activity.
 */
export async function getProjectLog(
    projectId: string,
    limit: number = DEFAULT_PROJECT_LOG_LIMIT
): Promise<ActivityEvent[]> {
    try {
        if (projectId === GLOBAL_PROJECT_ID) return getGlobalLog(limit);
        const storage = getProjectStorage(projectId);
        const events = (await getJson<ActivityEvent[]>(storage, ACTIVITY_KEY)) ?? [];
        return events.slice(-limit).reverse();
    } catch {
        return [];
    }
}

/**
 * Appends an activity event to the global (system) activity log.
 * Use for user and blueprint events. Never throws.
 */
export function logGlobal(event: ActivityEvent): void {
    try {
        const filePath = getGlobalActivityPath();
        let events: ActivityEvent[] = [];
        if (fs.existsSync(filePath)) {
            const raw = fs.readFileSync(filePath, 'utf-8');
            try {
                events = JSON.parse(raw) as ActivityEvent[];
            } catch {
                events = [];
            }
        }
        if (!Array.isArray(events)) events = [];
        const next = [...events, event];
        const trimmed = next.length > MAX_EVENTS_IN_FILE ? next.slice(-MAX_EVENTS_IN_FILE) : next;
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        writeJsonAtomic(filePath, trimmed);
        triggerEvent('activity.logged', { event });
    } catch {
        // fail silently
    }
}

/**
 * Returns recent global (system) activity, newest first.
 */
export async function getGlobalLog(
    limit: number = DEFAULT_PROJECT_LOG_LIMIT
): Promise<ActivityEvent[]> {
    try {
        const filePath = getGlobalActivityPath();
        if (!fs.existsSync(filePath)) return [];
        const raw = fs.readFileSync(filePath, 'utf-8');
        const events = (JSON.parse(raw) as ActivityEvent[]) ?? [];
        return events.slice(-limit).reverse();
    } catch {
        return [];
    }
}

export { toActivityEvent, systemUser };
