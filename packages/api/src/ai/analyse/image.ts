/**
 * POST /ai/analyse/image — Analyse image for alt text and caption.
 * When entryId and fieldPath are provided, orchestrates presence: try lock on
 * fieldPath.alt and fieldPath.caption, write values, release locks, broadcast.
 */

import express, { Router } from 'express';
import { getAdapter, getCredits, deductCredits, getCreditCost } from '@moteur/ai';
import { getProject } from '@moteur/core/projects.js';
import { getModelSchema } from '@moteur/core/models.js';
import { getEntry, updateEntry } from '@moteur/core/entries.js';
import { presenceStore } from '@moteur/presence/PresenceStore.js';
import { requireAuth } from '../../middlewares/auth.js';
import { analyseImage as runImageAnalysis } from '../imageAnalysis.js';

const router: Router = express.Router({ mergeParams: true });

const AI_LOCK_USER_ID = 'ai:image-analysis';
const AI_LOCK_TTL_MS = 10_000; // 10 seconds — safety net; AI releases explicitly

router.post('/', requireAuth, async (req: any, res: any) => {
    const { assetUrl, locale, projectId, modelId, entryId, fieldPath, modelLabel, entryTitle, categoryName } =
        req.body ?? {};

    if (!assetUrl || typeof assetUrl !== 'string' || !locale || typeof locale !== 'string') {
        return res.status(400).json({ error: 'assetUrl and locale are required' });
    }
    if (!projectId) {
        return res.status(400).json({ error: 'projectId is required' });
    }

    try {
        await getProject(req.user, projectId);
    } catch {
        return res.status(403).json({ error: 'Access to this project is forbidden' });
    }

    const adapter = await getAdapter();
    if (!adapter?.analyseImage) {
        return res.status(503).json({
            error: 'AI image analysis is disabled (no provider configured or provider does not support analyseImage)',
        });
    }

    const cost = getCreditCost('analyse.image');
    const balance = getCredits(projectId);
    if (balance < cost) {
        return res.status(402).json({
            error: 'insufficient_credits',
            creditsRemaining: balance,
        });
    }
    const deduct = deductCredits(projectId, cost);
    if (!deduct.success) {
        return res.status(402).json({
            error: 'insufficient_credits',
            creditsRemaining: deduct.remaining,
        });
    }

    let result: { alt: string; caption: string };
    try {
        result = await runImageAnalysis(adapter, assetUrl, {
            locale,
            modelLabel,
            entryTitle,
            categoryName,
        });
    } catch (err: any) {
        return res.status(500).json({
            error: err.message || 'Image analysis failed',
            creditsRemaining: getCredits(projectId),
        });
    }

    const creditsRemaining = getCredits(projectId);
    const creditsUsed = cost;

    // Entry context: acquire locks, write alt/caption, release, broadcast.
    // OPEN: media library analysis bypasses presence — when entryId/fieldPath are omitted we return alt/caption only; caller writes asset metadata directly. Confirm this is acceptable.
    const io = (req.app as any).locals?.io as { to(room: string): { emit(event: string, payload: unknown): void } } | undefined;
    const skippedFields: string[] = [];
    const written: { alt?: boolean; caption?: boolean } = {};

    if (entryId && fieldPath && modelId && io) {
        const altSubField = `${fieldPath}.alt`;
        const captionSubField = `${fieldPath}.caption`;

        const altGranted = presenceStore.tryLockField(projectId, altSubField, AI_LOCK_USER_ID, {
            ttlMs: AI_LOCK_TTL_MS,
        });
        if (altGranted) {
            io.to(projectId).emit('locks:update', {
                type: 'lock',
                fieldPath: altSubField,
                userId: AI_LOCK_USER_ID,
            });
        } else {
            skippedFields.push(altSubField);
        }

        const captionGranted = presenceStore.tryLockField(projectId, captionSubField, AI_LOCK_USER_ID, {
            ttlMs: AI_LOCK_TTL_MS,
        });
        if (captionGranted) {
            io.to(projectId).emit('locks:update', {
                type: 'lock',
                fieldPath: captionSubField,
                userId: AI_LOCK_USER_ID,
            });
        } else {
            skippedFields.push(captionSubField);
        }

        try {
            const entry = await getEntry(req.user, projectId, modelId, entryId);
            const data = { ...entry.data } as Record<string, unknown>;

            const arrayMatch = fieldPath.match(/^(\w+)\[(\d+)\]$/);
            let fieldValue: Record<string, unknown>;
            let patchData: Record<string, unknown>;

            if (arrayMatch) {
                const [, arrayKey, indexStr] = arrayMatch;
                const index = parseInt(indexStr, 10);
                const arr = Array.isArray(data[arrayKey]) ? [...(data[arrayKey] as unknown[])] : [];
                const item = typeof arr[index] === 'object' && arr[index] !== null ? { ...(arr[index] as Record<string, unknown>) } : {};
                fieldValue = item;
                if (altGranted) {
                    fieldValue.alt = result.alt;
                    written.alt = true;
                }
                if (captionGranted) {
                    fieldValue.caption = result.caption;
                    written.caption = true;
                }
                arr[index] = fieldValue;
                patchData = { ...data, [arrayKey]: arr };
            } else {
                const current = data[fieldPath];
                fieldValue = typeof current === 'object' && current !== null ? { ...(current as Record<string, unknown>) } : {};
                if (altGranted) {
                    const altMap = (typeof fieldValue.alt === 'object' && fieldValue.alt !== null ? { ...(fieldValue.alt as Record<string, string>) } : {}) as Record<string, string>;
                    altMap[locale] = result.alt;
                    fieldValue.alt = altMap;
                    written.alt = true;
                }
                if (captionGranted) {
                    const captionMap = (typeof fieldValue.caption === 'object' && fieldValue.caption !== null ? { ...(fieldValue.caption as Record<string, string>) } : {}) as Record<string, string>;
                    captionMap[locale] = result.caption;
                    fieldValue.caption = captionMap;
                    written.caption = true;
                }
                patchData = { ...data, [fieldPath]: fieldValue };
            }

            await updateEntry(req.user, projectId, modelId, entryId, { data: patchData });
        } catch (err: any) {
            if (altGranted) {
                presenceStore.unlockField(projectId, altSubField, AI_LOCK_USER_ID);
                io.to(projectId).emit('locks:update', { type: 'unlock', fieldPath: altSubField, userId: AI_LOCK_USER_ID });
            }
            if (captionGranted) {
                presenceStore.unlockField(projectId, captionSubField, AI_LOCK_USER_ID);
                io.to(projectId).emit('locks:update', {
                    type: 'unlock',
                    fieldPath: captionSubField,
                    userId: AI_LOCK_USER_ID,
                });
            }
            return res.status(500).json({
                error: err.message || 'Failed to write analysis to entry',
                creditsRemaining,
            });
        }

        if (altGranted) {
            presenceStore.unlockField(projectId, altSubField, AI_LOCK_USER_ID);
            io.to(projectId).emit('locks:update', { type: 'unlock', fieldPath: altSubField, userId: AI_LOCK_USER_ID });
        }
        if (captionGranted) {
            presenceStore.unlockField(projectId, captionSubField, AI_LOCK_USER_ID);
            io.to(projectId).emit('locks:update', {
                type: 'unlock',
                fieldPath: captionSubField,
                userId: AI_LOCK_USER_ID,
            });
        }
    }

    return res.json({
        alt: result.alt,
        caption: result.caption,
        creditsUsed,
        creditsRemaining,
        ...(skippedFields.length > 0 && { skippedFields }),
        ...(Object.keys(written).length > 0 && { written }),
    });
});

export default router;
