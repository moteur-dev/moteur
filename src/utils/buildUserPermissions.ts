import { loadProjectPolicy } from './projectPolicy.js';
import { User } from '../types/User.js';
import { Permission, parsePermission } from '../types/Permission.js';

export function buildUserPermissions(
    projectId: string,
    raw: User
): { id: string; email: string; permissions: Permission[] } {
    const { roles: roleDefs, roleHierarchy } = loadProjectPolicy(projectId);

    // 1) Resolve all roles, including inherited
    const allRoles = new Set<string>(raw.roles);
    const stack = [...raw.roles];
    while (stack.length) {
        const r = stack.pop()!;
        for (const parent of roleHierarchy[r] ?? []) {
            if (!allRoles.has(parent)) {
                allRoles.add(parent);
                stack.push(parent);
            }
        }
    }

    // 2) Collect all Permission objects from those roles
    const perms: Permission[] = [];
    for (const role of allRoles) {
        perms.push(...(roleDefs[role] ?? []));
    }

    // 3) Append any one-off overrides
    for (const rawPerm of raw.extraPermissions ?? []) {
        perms.push(parsePermission(rawPerm));
    }

    return { id: raw.id, email: raw.email, permissions: perms };
}
