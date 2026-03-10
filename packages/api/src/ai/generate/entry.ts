import express, { Router } from 'express';
import { OpenAPIV3 } from 'openapi-types';
import { getProject } from '@moteur/core/projects.js';
import { getModelSchema } from '@moteur/core/models.js';
import { getAdapter, getCredits, deductCredits, getCreditCost } from '@moteur/ai';
import { requireProjectAccess } from '../../middlewares/auth.js';

const router: Router = express.Router({ mergeParams: true });

function formatFieldListForPrompt(fields: Record<string, any>): string {
    return Object.entries(fields)
        .map(([key, def]) => {
            const type = def.type;
            const label = def.label || '';
            const description = def.description || '';
            return `- ${key} (${type}): ${label} — ${description}`;
        })
        .join('\n');
}

router.post('/', requireProjectAccess, async (req: any, res: any) => {
    const { prompt, projectId, modelId, locale: _locale = 'en' } = req.body;
    const pid = projectId || req.params.projectId;
    const mid = modelId || req.params.modelId;

    if (!prompt || !pid || !mid) {
        return res.status(400).json({ error: 'Missing required parameters: prompt, projectId, modelId' });
    }

    const adapter = await getAdapter();
    if (!adapter?.generate) {
        return res.status(503).json({
            error: 'AI entry generation is disabled (no provider configured)',
        });
    }

    try {
        await getProject(req.user!, pid);
        const model = await getModelSchema(req.user!, pid, mid);
        if (!model) return res.status(404).json({ error: 'Model not found' });

        const cost = getCreditCost('generate.entry');
        const balance = getCredits(pid);
        if (balance < cost) {
            return res.status(402).json({
                error: 'insufficient_credits',
                message: 'Not enough AI credits for entry generation',
            });
        }
        const { success } = deductCredits(pid, cost);
        if (!success) {
            return res.status(402).json({
                error: 'insufficient_credits',
                message: 'Not enough AI credits',
            });
        }

        const fieldList = formatFieldListForPrompt(model.fields ?? {});
        const systemPrompt = `
You are a structured content generator for a CMS called Moteur.

Given a user prompt and a list of fields in a content model, your job is to generate a complete content "entry".

Each field must be populated with a realistic value.

Return JSON in this shape:
{
  "data": {
    "title": { "en": "Example Title" },
    "coverImage": {
      "src": "https://example.com/cat.jpg",
      "alt": { "en": "A cat" }
    },
    "published": { "value": true },
    ...
  }
}

Model fields:
${fieldList}
`.trim();

        const content = await adapter.generate(prompt, {
            system: systemPrompt,
            temperature: 0.6,
            maxTokens: 4096,
        });
        if (!content?.trim()) throw new Error('Empty response from AI');

        const parsed = JSON.parse(content.trim());
        parsed.type = mid;

        const remaining = getCredits(pid);
        return res.json({
            success: true,
            entry: parsed,
            creditsUsed: cost,
            creditsRemaining: remaining,
        });
    } catch (err: any) {
        console.error('AI generate/entry failed:', err);
        return res.status(500).json({ error: err.message || 'AI entry generation failed' });
    }
});

export const openapi: Record<string, OpenAPIV3.PathItemObject> = {
    '/generate/entry': {
        post: {
            summary: 'Generate an entry using AI based on model schema',
            tags: ['AI'],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                prompt: { type: 'string', description: 'User-provided description' },
                                projectId: { type: 'string' },
                                modelId: { type: 'string' },
                                locale: { type: 'string', default: 'en' }
                            },
                            required: ['prompt', 'projectId', 'modelId']
                        }
                    }
                }
            },
            responses: {
                '200': { description: 'Entry generated' },
                '402': { description: 'Insufficient AI credits' },
                '503': { description: 'AI disabled' }
            }
        }
    }
};

export default router;
