import express, { Router } from 'express';
import { getProject } from '@moteur/core/projects.js';
import { getModelSchema } from '@moteur/core/models.js';
import { getEntry } from '@moteur/core/entries.js';
import { requireProjectAccess } from '../../middlewares/auth.js';
import { getCredits } from '../credits.js';
import { translateField } from '../translation.js';
import type { MoteurAIContext } from '@moteur/ai';

const router: Router = express.Router({ mergeParams: true });

router.post('/', requireProjectAccess, async (req: any, res: any) => {
    const { entryId, fieldPath, fromLocale, toLocale } = req.body;
    const projectId = req.body.projectId || req.params.projectId;
    const modelId = req.body.modelId || req.params.modelId;

    if (!projectId || !modelId) {
        return res.status(400).json({ error: 'projectId and modelId are required' });
    }
    if (!entryId || !fieldPath || !fromLocale || !toLocale) {
        return res.status(400).json({
            error: 'entryId, fieldPath, fromLocale, and toLocale are required',
        });
    }

    try {
        const project = await getProject(req.user!, projectId);
        const model = await getModelSchema(req.user!, projectId, modelId);
        if (!model) {
            return res.status(404).json({ error: 'Model not found' });
        }
        const entry = await getEntry(req.user!, projectId, modelId, entryId);

        let rawValue: unknown;
        let fieldType: 'core/text' | 'core/rich-text' | 'core/textarea' = 'core/text';
        const dot = fieldPath.indexOf('.');
        if (dot > 0) {
            const parentPath = fieldPath.slice(0, dot);
            const subField = fieldPath.slice(dot + 1);
            const parentDef = model.fields?.[parentPath];
            if (!parentDef?.fields?.[subField]) {
                return res.status(400).json({ error: `Field "${fieldPath}" not found` });
            }
            const subDef = parentDef.fields[subField];
            const multilingual = subDef.options?.multilingual ?? true;
            if (!multilingual) {
                return res.status(400).json({ error: 'Field is not multilingual' });
            }
            const parentValue = entry.data?.[parentPath];
            rawValue =
                typeof parentValue === 'object' && parentValue !== null && subField in parentValue
                    ? (parentValue as Record<string, unknown>)[subField]
                    : undefined;
            fieldType = (subDef.type ?? 'core/text') as 'core/text' | 'core/rich-text' | 'core/textarea';
            if (!['core/text', 'core/rich-text', 'core/textarea'].includes(fieldType)) {
                fieldType = 'core/text';
            }
        } else {
            const fieldDef = model.fields?.[fieldPath];
            if (!fieldDef) {
                return res.status(400).json({ error: `Field "${fieldPath}" not found` });
            }
            const multilingual = fieldDef.options?.multilingual ?? false;
            if (!multilingual) {
                return res.status(400).json({ error: 'Field is not multilingual' });
            }
            fieldType = (fieldDef.type ?? 'core/text') as 'core/text' | 'core/rich-text' | 'core/textarea';
            if (!['core/text', 'core/rich-text', 'core/textarea'].includes(fieldType)) {
                return res.status(400).json({ error: 'Field type is not translatable' });
            }
            rawValue = entry.data?.[fieldPath];
        }
        const sourceValue =
            typeof rawValue === 'object' && rawValue !== null && (rawValue as any)[fromLocale] != null
                ? String((rawValue as any)[fromLocale])
                : typeof rawValue === 'string'
                  ? rawValue
                  : '';

        const projectLocales = [project.defaultLocale, ...(project.supportedLocales ?? [])].filter(Boolean);
        const context: MoteurAIContext = {
            projectId,
            projectName: project.label,
            projectLocales,
            defaultLocale: project.defaultLocale ?? 'en',
            model: { id: modelId, label: model.label ?? modelId, fields: model.fields ?? {} },
            entry: entry.data,
            credits: { remaining: getCredits(projectId) },
        };

        const value = await translateField(
            sourceValue,
            fieldType,
            fromLocale,
            toLocale,
            context
        );

        const remaining = getCredits(projectId);
        const creditsUsed = context.credits.remaining - remaining;

        return res.json({
            value,
            creditsUsed,
            creditsRemaining: remaining,
        });
    } catch (err: any) {
        if (err.message === 'INSUFFICIENT_CREDITS') {
            return res.status(402).json({
                error: 'insufficient_credits',
                message: 'Not enough AI credits',
            });
        }
        if (err.message === 'AI provider not configured') {
            return res.status(503).json({
                error: 'AI translation is disabled (no provider configured)',
            });
        }
        console.error('[AI translate/field]', err);
        return res.status(500).json({ error: err.message || 'Translation failed' });
    }
});

export default router;
