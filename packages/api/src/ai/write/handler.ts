import type { Request, Response } from 'express';
import { getProject } from '@moteur/core/projects.js';
import { getModelSchema } from '@moteur/core/models.js';
import { getEntry } from '@moteur/core/entries.js';
import type { MoteurAIContext } from '@moteur/ai';
import { getCredits } from '../credits.js';
import { runWritingAction, type WritingAction, type FieldMeta } from '../writing.js';

export function createWriteHandler(action: WritingAction) {
    return async (req: Request, res: Response): Promise<void> => {
        const {
            entryId,
            fieldPath,
            locale,
            bodyValueForExcerpt,
            currentValue,
            currentEntryData,
            graceRegenerate,
        } = (req as any).body;
        const projectId = (req as any).body.projectId || (req as any).params.projectId;
        const modelId = (req as any).body.modelId || (req as any).params.modelId;

        if (!projectId || !modelId) {
            res.status(400).json({ error: 'projectId and modelId are required' });
            return;
        }
        if (typeof fieldPath !== 'string' || !locale) {
            res.status(400).json({ error: 'fieldPath and locale are required' });
            return;
        }

        try {
            const project = await getProject((req as any).user!, projectId);
            const model = await getModelSchema((req as any).user!, projectId, modelId);
            if (!model) {
                res.status(404).json({ error: 'Model not found' });
                return;
            }

            const projectLocales = [project.defaultLocale, ...(project.supportedLocales ?? [])].filter(Boolean);
            const creditsRemaining = getCredits(projectId);

            let entry: Record<string, unknown> | null = null;
            if (entryId) {
                const fetched = await getEntry((req as any).user!, projectId, modelId, entryId);
                if (fetched?.data) {
                    entry = fetched.data as Record<string, unknown>;
                }
            }
            if (!entry && currentEntryData && typeof currentEntryData === 'object') {
                entry = currentEntryData as Record<string, unknown>;
            }

            const fieldDef = model.fields?.[fieldPath];
            if (!fieldDef) {
                res.status(400).json({ error: `Field "${fieldPath}" not found on model` });
                return;
            }

            const fieldType = fieldDef.type;
            if (
                fieldType !== 'core/text' &&
                fieldType !== 'core/rich-text' &&
                fieldType !== 'core/textarea'
            ) {
                res.status(400).json({
                    error: 'AI writing is only supported for core/text, core/rich-text, and core/textarea',
                });
                return;
            }

            const fieldMeta: FieldMeta = {
                label: fieldDef.label ?? fieldPath,
                type: fieldType as 'core/text' | 'core/rich-text' | 'core/textarea',
                fieldKey: fieldPath,
            };

            const context: MoteurAIContext = {
                projectId,
                projectName: project.label,
                projectLocales,
                defaultLocale: project.defaultLocale ?? 'en',
                model: { id: modelId, label: model.label ?? modelId, fields: model.fields ?? {} },
                entry: entry ?? undefined,
                credits: { remaining: creditsRemaining },
            };

            const currentFieldValue =
                currentValue !== undefined
                    ? (currentValue === null ? null : String(currentValue))
                    : entry && entry[fieldPath] != null
                      ? String(entry[fieldPath])
                      : null;

            const bodyForExcerpt =
                bodyValueForExcerpt ??
                (entry && typeof (entry as any).body === 'string' ? (entry as any).body : undefined);

            const value = await runWritingAction(
                action,
                currentFieldValue,
                fieldMeta,
                context,
                {
                    locale,
                    bodyValueForExcerpt: bodyForExcerpt,
                    skipDeduction: !!graceRegenerate,
                }
            );

            const remaining = getCredits(projectId);
            const cost = creditsRemaining - remaining;
            const creditsUsed = graceRegenerate ? 0 : cost;

            res.json({
                value,
                creditsUsed,
                creditsRemaining: remaining,
            });
        } catch (err: any) {
            if (err.message === 'INSUFFICIENT_CREDITS') {
                res.status(402).json({
                    error: 'insufficient_credits',
                    message: 'Not enough AI credits for this action',
                });
                return;
            }
            if (err.message === 'AI provider not configured') {
                res.status(503).json({
                    error: 'AI writing is disabled (no provider configured)',
                });
                return;
            }
            console.error('[AI write]', err);
            res.status(500).json({ error: err.message || 'AI writing failed' });
        }
    };
}
