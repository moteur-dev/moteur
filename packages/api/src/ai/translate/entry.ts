import express, { Router } from 'express';
import { getProject } from '@moteur/core/projects.js';
import { getModelSchema } from '@moteur/core/models.js';
import { getEntry } from '@moteur/core/entries.js';
import { requireProjectAccess } from '../../middlewares/auth.js';
import { getCredits } from '../credits.js';
import { translateEntry } from '../translation.js';
import type { MoteurAIContext } from '@moteur/ai';

const router: Router = express.Router({ mergeParams: true });

router.post('/', requireProjectAccess, async (req: any, res: any) => {
    const { entryId, fromLocale, toLocales } = req.body;
    const projectId = req.body.projectId || req.params.projectId;
    const modelId = req.body.modelId || req.params.modelId;

    if (!projectId || !modelId) {
        return res.status(400).json({ error: 'projectId and modelId are required' });
    }
    if (!entryId || !fromLocale || !Array.isArray(toLocales) || toLocales.length === 0) {
        return res.status(400).json({
            error: 'entryId, fromLocale, and toLocales (non-empty array) are required'
        });
    }

    try {
        const project = await getProject(req.user!, projectId);
        const model = await getModelSchema(req.user!, projectId, modelId);
        if (!model) {
            return res.status(404).json({ error: 'Model not found' });
        }
        const entry = await getEntry(req.user!, projectId, modelId, entryId);

        const projectLocales = [project.defaultLocale, ...(project.supportedLocales ?? [])].filter(
            Boolean
        );
        const context: MoteurAIContext = {
            projectId,
            projectName: project.label,
            projectLocales,
            defaultLocale: project.defaultLocale ?? 'en',
            model: { id: modelId, label: model.label ?? modelId, fields: model.fields ?? {} },
            entry: entry.data,
            credits: { remaining: getCredits(projectId) }
        };

        const fields = await translateEntry(
            { id: entry.id, data: entry.data },
            model as any,
            fromLocale,
            toLocales,
            context
        );

        const remaining = getCredits(projectId);
        const creditsUsed = context.credits.remaining - remaining;

        return res.json({
            fields,
            creditsUsed,
            creditsRemaining: remaining
        });
    } catch (err: any) {
        if (err.message === 'INSUFFICIENT_CREDITS') {
            return res.status(402).json({
                error: 'insufficient_credits',
                message: 'Not enough AI credits'
            });
        }
        if (err.message === 'AI provider not configured') {
            return res.status(503).json({
                error: 'AI translation is disabled (no provider configured)'
            });
        }
        console.error('[AI translate/entry]', err);
        return res.status(500).json({ error: err.message || 'Translation failed' });
    }
});

export default router;
