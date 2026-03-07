import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

const ADMIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const PUBLIC_WINDOW_MS = 15 * 60 * 1000;

function getAdminMax(): number {
    const v = (process.env.API_RATE_LIMIT_ADMIN_MAX ?? '').trim();
    if (v === '' || v === '0') return 10000; // effectively no limit
    const n = parseInt(v, 10);
    return Number.isFinite(n) && n > 0 ? n : 10000;
}

function getPublicMax(): number {
    const v = (process.env.API_RATE_LIMIT_PUBLIC_MAX ?? '').trim();
    if (v === '' || v === '0') return 1000; // default per project per window
    const n = parseInt(v, 10);
    return Number.isFinite(n) && n > 0 ? n : 1000;
}

/**
 * Rate limiter for admin API (e.g. /admin/*).
 * Key: IP. Default: high limit (no practical limit); set API_RATE_LIMIT_ADMIN_MAX to enforce.
 */
export const adminRateLimiter = rateLimit({
    windowMs: ADMIN_WINDOW_MS,
    max: getAdminMax(),
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request) => (req.ip || 'unknown') as string,
    message: { error: 'Too many admin requests; try again later.' }
});

/**
 * Rate limiter for public API (collections, pages, templates).
 * Key: projectId so limits are per project. Set API_RATE_LIMIT_PUBLIC_MAX to limit (default 1000/15min).
 */
export const publicRateLimiter = rateLimit({
    windowMs: PUBLIC_WINDOW_MS,
    max: getPublicMax(),
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request) => {
        const projectId = (req as any).apiRequestProjectId;
        return projectId ? `public:${projectId}` : req.ip || 'unknown';
    },
    message: { error: 'Too many requests for this project; try again later.' }
});

/**
 * Runs the public rate limiter only when the request was classified as public.
 * Must be used after requestClassifier.
 */
export function publicRateLimitGate(req: Request, res: Response, next: NextFunction): void {
    if ((req as any).apiRequestType !== 'public') {
        next();
        return;
    }
    publicRateLimiter(req, res, next);
}
