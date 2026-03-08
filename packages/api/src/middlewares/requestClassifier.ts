import { Request, Response, NextFunction } from 'express';

export type ApiRequestType = 'admin' | 'public' | null;

/**
 * Classifies the request as admin API or public API (or neither).
 * Must run early so rate limiting and usage logging can use it.
 * Sets:
 *   req.apiRequestType = 'admin' | 'public' | null
 *   req.apiRequestProjectId = string | undefined (for public, the projectId from path)
 */
export function requestClassifier(req: Request, res: Response, next: NextFunction): void {
    const path = (req.originalUrl || req.url || '').split('?')[0];
    (req as any).apiRequestType = null;
    (req as any).apiRequestProjectId = undefined;

    // Admin API: anything under /admin
    if (path.includes('/admin/')) {
        (req as any).apiRequestType = 'admin';
        next();
        return;
    }

    // Public API: project-scoped read endpoints (collections, pages, templates, forms)
    // Pattern: .../projects/:projectId/collections/... or .../projects/:projectId/pages or .../projects/:projectId/templates or .../projects/:projectId/forms
    const projectsMatch = path.match(
        /\/projects\/([^/]+)(?:\/(collections|pages|templates|forms))(?:\/|$)/
    );
    if (projectsMatch) {
        const projectId = projectsMatch[1];
        // Count as public: collections (API key), pages, templates (public read)
        (req as any).apiRequestType = 'public';
        (req as any).apiRequestProjectId = projectId;
    }

    next();
}
