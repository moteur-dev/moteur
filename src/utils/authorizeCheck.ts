// src/utils/authorizeCheck.ts
import { canPerform, Permission, Action, ResourceType } from '../types/Permission.js';
import { buildUserPermissions } from './buildUserPermissions.js';
import type { User } from '../types/User.js';

export async function authorizeCheck(
    rawUser: User, // from JWT or CLI login
    projectId: string,
    action: Action,
    resource: ResourceType,
    scope: string[]
): Promise<void> {
    // 1) Build the fully scoped user.permissions
    const { permissions } = buildUserPermissions(projectId, rawUser);

    // 2) Assemble the required permission
    const required: Permission = { action, resource, scope };

    // 3) Check, and throw if forbidden
    if (!canPerform(permissions, required)) {
        throw new Error('Forbidden');
    }
}
