import fs from 'fs';
import path from 'path';
import { Permission, parsePermission } from '../types/Permission.js';

interface RawPolicy {
    roles?: Record<string, (string | Permission)[]>;
    roleHierarchy?: Record<string, string[]>;
}

export interface ProjectPolicy {
    roles: Record<string, Permission[]>;
    roleHierarchy: Record<string, string[]>;
}

/** Return `{ roles, roleHierarchy }` merged global + project JSON */
export function loadProjectPolicy(projectId: string): ProjectPolicy {
    const baseDir = path.resolve('data');
    const globalRaw = loadRaw(path.join(baseDir, 'permissions.json'));
    const projectRaw = loadRaw(path.join(baseDir, 'projects', projectId, 'permissions.json'));

    const merged: ProjectPolicy = { roles: {}, roleHierarchy: {} };

    [globalRaw, projectRaw].forEach(src => {
        if (src.roles) {
            Object.entries(src.roles).forEach(([role, perms]) => {
                const parsed: Permission[] = perms.map(item =>
                    typeof item === 'string' ? parsePermission(item) : item
                );
                merged.roles[role] = [...(merged.roles[role] ?? []), ...parsed];
            });
        }
        if (src.roleHierarchy) {
            Object.entries(src.roleHierarchy).forEach(([role, parents]) => {
                merged.roleHierarchy[role] = [...(merged.roleHierarchy[role] ?? []), ...parents];
            });
        }
    });

    return merged;
}

function loadRaw(filePath: string): RawPolicy {
    if (!fs.existsSync(filePath)) return {};
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}
