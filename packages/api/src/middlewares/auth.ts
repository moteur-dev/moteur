import { Request, Response, NextFunction } from 'express';
import { verifyJWT } from '@moteur/core/auth.js';
import { getUserById } from '@moteur/core/users.js';
import { getProject } from '@moteur/core/projects.js';
import { verifyKey } from '@moteur/core/projectApiKey.js';

export function requireAuth(req: any, res: any, next: NextFunction) {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const payload = verifyJWT(token);
        const user = getUserById(payload.sub as string);
        if (!user || !user.id || !user.isActive) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
        (req as any).user = user;
        next();
    } catch (err) {
        return res.status(401).json({
            error:
                'Invalid or expired token: ' +
                (err instanceof Error ? err.message : 'Unknown error')
        });
    }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
    requireAuth(req, res, () => {
        const user = (req as any).user;
        if (!user.roles.includes('admin')) {
            return res.status(403).json({ error: 'Admin access required' });
        }
        next();
    });
}

export function requireRole(requiredRole: string) {
    return (req: Request, res: Response, next: NextFunction) => {
        requireAuth(req, res, () => {
            const user = (req as any).user;
            if (!user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            if (!user.roles.includes(requiredRole)) {
                return res.status(403).json({ error: 'Forbidden' });
            }
            next();
        });
    };
}

/** Sets req.user if valid JWT present; does not fail if no token or invalid. */
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
    const token = (req as any).headers?.authorization?.replace('Bearer ', '');
    if (!token) return next();
    try {
        const payload = verifyJWT(token);
        const user = getUserById(payload.sub as string);
        if (user?.id && user.isActive) (req as any).user = user;
    } catch {
        // ignore invalid token for optional auth
    }
    next();
}

export function requireProjectAccess(req: Request, res: Response, next: NextFunction) {
    requireAuth(req, res, async () => {
        const user = (req as any).user;
        const projectId = req.params.projectId || req.body.projectId;

        if (!projectId) {
            return res.status(400).json({ error: 'Project ID is required' });
        }

        try {
            const project = await getProject(user, projectId);
            if (!project.users?.includes(user.id)) {
                return res.status(403).json({ error: 'Access to this project is forbidden' });
            }
            next();
        } catch {
            return res.status(403).json({ error: 'Access to this project is forbidden' });
        }
    });
}

/**
 * Recognizes project API key from header x-api-key or query apiKey.
 * If key is present: verifies against projectId (from req.params.projectId); if valid sets req.apiKeyAuth = true, else 401.
 * If key is not present: next() (caller may require JWT via requireAuth).
 */
export function apiKeyAuth(req: Request, res: Response, next: NextFunction): void {
    const rawKey =
        (req.headers['x-api-key'] as string)?.trim() ||
        (typeof req.query.apiKey === 'string' ? req.query.apiKey.trim() : '');
    if (!rawKey) {
        next();
        return;
    }

    const projectId = req.params.projectId;
    if (!projectId) {
        res.status(400).json({ error: 'Project ID is required' });
        return;
    }
    verifyKey(projectId, rawKey)
        .then(valid => {
            if (!valid) {
                res.status(401).json({ error: 'Invalid API key' });
                return;
            }
            (req as any).apiKeyAuth = true;
            next();
        })
        .catch(() => {
            res.status(401).json({ error: 'Invalid API key' });
        });
}

/**
 * Requires either JWT (req.user) or API key (req.apiKeyAuth).
 * If only API key and method is not GET, returns 403 (read-only).
 */
export function requireCollectionAuth(req: Request, res: Response, next: NextFunction): void {
    const hasUser = !!(req as any).user;
    const hasApiKey = (req as any).apiKeyAuth === true;
    if (!hasUser && !hasApiKey) {
        res.status(401).json({ error: 'Authentication required (API key or JWT)' });
        return;
    }
    if (!hasUser && hasApiKey && req.method !== 'GET') {
        res.status(403).json({ error: 'API key is read-only; use JWT for write operations' });
        return;
    }
    next();
}
