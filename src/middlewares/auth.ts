import { Request, Response, NextFunction } from 'express';
import { verifyJWT } from '../api/auth';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const user = verifyJWT(token);
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

export function requireProjectAccess(req: Request, res: Response, next: NextFunction) {
    requireAuth(req, res, () => {
        const user = (req as any).user;
        const projectId = req.params.projectId || req.body.projectId;

        if (!projectId) {
            return res.status(400).json({ error: 'Project ID is required' });
        }

        if (!user.projects.includes(projectId)) {
            return res.status(403).json({ error: 'Access to this project is forbidden' });
        }

        next();
    });
}
