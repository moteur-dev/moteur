export enum Action {
    View = 'view',
    Edit = 'edit',
    Publish = 'publish',
    Delete = 'delete'
}

export enum ResourceType {
    Project = 'project',
    Model = 'model',
    Entry = 'entry',
    Field = 'field',
    Layout = 'layout',
    Block = 'block',
    Structure = 'structure',
    Page = 'page',
    Template = 'template',
    User = 'user'
}

export interface Permission {
    action: Action;
    resource: ResourceType;
    scope: string[]; // e.g. [projectId, modelId, fieldName]
}

export function parsePermission(raw: string): Permission {
    console.warn(raw);
    const [act, res, ...scope] = raw.split(':');
    return {
        action: act as Action,
        resource: res as ResourceType,
        scope
    };
}

export function serializePermission(p: Permission): string {
    return [p.action, p.resource, ...p.scope].join(':');
}

export function canPerform(userPerms: Permission[], required: Permission): boolean {
    return userPerms.some(grant => {
        if (grant.action !== required.action) return false;
        if (grant.resource !== required.resource) return false;

        const len = Math.max(grant.scope.length, required.scope.length);
        for (let i = 0; i < len; i++) {
            const g = grant.scope[i] ?? '*';
            const r = required.scope[i] ?? '';
            if (g !== '*' && g !== r) return false;
        }
        return true;
    });
}
