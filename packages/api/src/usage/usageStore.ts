/**
 * Tracks API request counts in two separate buckets: admin and public.
 * Used for audit, billing, and (with rate limiting) enforcing limits.
 * Admin: global count (no per-project; studio/back-office).
 * Public: per-project count (API key / collections usage).
 *
 * Current implementation is in-memory (counts reset on restart). For multi-instance
 * or persistent billing, replace with a store that implements the same record/get/reset
 * contract (e.g. Redis or DB-backed).
 */

export type RequestType = 'admin' | 'public';

export interface UsageCounts {
    admin: { total: number; windowStart: number };
    public: { byProject: Record<string, { total: number; windowStart: number }> };
}

const state: UsageCounts = {
    admin: { total: 0, windowStart: Date.now() },
    public: { byProject: {} }
};

/** Record one admin API request. */
export function recordAdminRequest(): void {
    state.admin.total += 1;
}

/** Record one public API request for a project. */
export function recordPublicRequest(projectId: string): void {
    if (!state.public.byProject[projectId]) {
        state.public.byProject[projectId] = { total: 0, windowStart: Date.now() };
    }
    state.public.byProject[projectId].total += 1;
}

/** Get current usage counts (for admin UI or billing). */
export function getUsageCounts(): UsageCounts {
    return {
        admin: { ...state.admin },
        public: {
            byProject: Object.fromEntries(
                Object.entries(state.public.byProject).map(([k, v]) => [k, { ...v }])
            )
        }
    };
}

/** Reset admin count (e.g. new billing window). */
export function resetAdminCount(): void {
    state.admin = { total: 0, windowStart: Date.now() };
}

/** Reset public count for a project or all. */
export function resetPublicCount(projectId?: string): void {
    if (projectId) {
        delete state.public.byProject[projectId];
    } else {
        state.public.byProject = {};
    }
}
