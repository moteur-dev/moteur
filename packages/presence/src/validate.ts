/**
 * Lightweight validation for presence payloads. Reject or trim invalid input.
 */
import type { PresenceUpdate } from '@moteur/types/Presence';

const MAX_STRING_LENGTH = 2048;
const CURSOR_MAX = 100;

export interface JoinPayload {
    projectId?: unknown;
    screenId?: unknown;
}

export function validateJoinPayload(
    payload: unknown
): { projectId: string; screenId?: string } | null {
    if (!payload || typeof payload !== 'object') return null;
    const p = payload as JoinPayload;
    const projectId = typeof p.projectId === 'string' ? p.projectId.trim() : '';
    if (!projectId || projectId.length > MAX_STRING_LENGTH) return null;
    const screenId =
        p.screenId !== undefined && p.screenId !== null && typeof p.screenId === 'string'
            ? p.screenId.trim().slice(0, MAX_STRING_LENGTH)
            : undefined;
    return { projectId, screenId: screenId || undefined };
}

export function validatePresenceUpdate(payload: unknown): PresenceUpdate | null {
    if (!payload || typeof payload !== 'object') return null;
    const p = payload as Record<string, unknown>;
    const result: PresenceUpdate = {};

    if (p.screenId !== undefined && p.screenId !== null) {
        if (typeof p.screenId !== 'string') return null;
        result.screenId = p.screenId.trim().slice(0, MAX_STRING_LENGTH);
    }
    if (p.entryId !== undefined && p.entryId !== null) {
        if (typeof p.entryId !== 'string') return null;
        result.entryId = p.entryId.trim().slice(0, MAX_STRING_LENGTH);
    }
    if (p.fieldPath !== undefined && p.fieldPath !== null) {
        if (typeof p.fieldPath !== 'string') return null;
        result.fieldPath = p.fieldPath.trim().slice(0, MAX_STRING_LENGTH);
    }
    if (p.typing !== undefined && p.typing !== null) {
        if (typeof p.typing !== 'boolean') return null;
        result.typing = p.typing;
    }
    if (p.textPreview !== undefined && p.textPreview !== null) {
        if (typeof p.textPreview !== 'string') return null;
        result.textPreview = p.textPreview.slice(0, MAX_STRING_LENGTH);
    }
    if (p.cursor !== undefined && p.cursor !== null) {
        if (typeof p.cursor !== 'object' || p.cursor === null) return null;
        const c = p.cursor as Record<string, unknown>;
        const x = typeof c.x === 'number' ? Math.max(0, Math.min(CURSOR_MAX, c.x)) : undefined;
        const y = typeof c.y === 'number' ? Math.max(0, Math.min(CURSOR_MAX, c.y)) : undefined;
        if (x === undefined && y === undefined) return null;
        result.cursor = { x: x ?? 0, y: y ?? 0 };
    }

    return Object.keys(result).length > 0 ? result : {};
}
