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
