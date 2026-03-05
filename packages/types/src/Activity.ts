export type ActivityResourceType =
    | 'entry'
    | 'layout'
    | 'page'
    | 'structure'
    | 'model'
    | 'project'
    | 'user'
    | 'blueprint';

export type ActivityAction = 'created' | 'updated' | 'deleted' | 'published' | 'unpublished';

export interface ActivityEvent {
    id: string;
    projectId: string;
    resourceType: ActivityResourceType;
    resourceId: string;
    action: ActivityAction;
    userId: string;
    userName: string;
    fieldPath?: string;
    before?: unknown;
    after?: unknown;
    timestamp: string; // ISO
}

/** Paginated activity log: events newest first, plus optional cursor for next page. */
export interface ActivityLogPage {
    events: ActivityEvent[];
    /** ISO timestamp of the oldest event in this page; use as `before` query param for the next page. */
    nextBefore?: string;
}
