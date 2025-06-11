import { Request, Response, NextFunction } from 'express';
import { authorizeCheck } from '../utils/authorizeCheck.js';
import type { User } from '../types/User.js';
import { Action, ResourceType } from '../types/Permission.js';

export function authorize(
    action: Action,
    resource: ResourceType,
    ...scopeParamNames: string[] // e.g. ['projectId','modelId','fieldName']
) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // 1) Extract raw user info from JWT payload
            const tokenData = (req as any).user as User;
            // 2) Pull projectId + any other scope values from params
            const projectId = req.params.projectId!;
            const scope = scopeParamNames.map(name => req.params[name]);

            // 3) Call the shared check
            await authorizeCheck(tokenData, projectId, action, resource, scope);

            // 4) If no error, proceed
            next();
        } catch (err) {
            res.status(err instanceof Error && err.message === 'Forbidden' ? 403 : 401).json({
                error: err instanceof Error ? err.message : 'Unknown error'
            });
        }
    };
}
