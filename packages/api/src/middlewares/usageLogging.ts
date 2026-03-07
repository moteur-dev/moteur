import { Request, Response, NextFunction } from 'express';
import { recordAdminRequest, recordPublicRequest } from '../usage/usageStore.js';
import { logRequest } from '../usage/requestLogger.js';

/**
 * Records the request in the usage store (admin vs public, separate counters)
 * and appends to the audit log file if configured.
 * Call after requestClassifier. Runs on response finish so status code is known.
 */
export function usageLogging(req: Request, res: Response, next: NextFunction): void {
    const type = (req as any).apiRequestType as 'admin' | 'public' | null;
    const projectId = (req as any).apiRequestProjectId as string | undefined;
    const startTime = Date.now();

    function onFinish(): void {
        res.removeListener('finish', onFinish);
        if (type === 'admin') {
            recordAdminRequest();
        } else if (type === 'public' && projectId) {
            recordPublicRequest(projectId);
        }
        logRequest(req, res, type, projectId, startTime);
    }

    res.on('finish', onFinish);
    next();
}
