import express, { Router } from 'express';
import fieldRegistry from '@moteur/core/registry/FieldRegistry.js';
import { OpenAPIV3 } from 'openapi-types';
import { getAdapter } from '@moteur/ai';
import { requireAdmin } from '../../middlewares/auth.js';

const router: Router = express.Router({ mergeParams: true });

function formatFieldSchemasForPrompt(fields: Record<string, any>): string {
    const simplified = Object.entries(fields).reduce(
        (acc, [key, def]) => {
            acc[key] = {
                label: def.label,
                description: def.description,
                fields: def.fields,
                meta: def.meta
            };
            return acc;
        },
        {} as Record<string, any>
    );
    return JSON.stringify(simplified, null, 2);
}

router.post('/', requireAdmin, async (req: any, res: any) => {
    const { prompt, currentFields } = req.body;

    if (!prompt || typeof currentFields !== 'object') {
        return res.status(400).json({ error: 'Missing or invalid prompt / currentFields' });
    }

    const adapter = await getAdapter();
    if (!adapter?.generate) {
        return res.status(503).json({
            error: 'AI generation is disabled (no provider configured)'
        });
    }

    try {
        const coreFieldDefs = fieldRegistry.all();
        const availableFieldTypes = formatFieldSchemasForPrompt(coreFieldDefs);
        const systemPrompt = `
You are a schema assistant for a headless CMS called Moteur.

Your job is to help generate new field definitions based on a user prompt.

You receive:
- A user prompt
- A current list of existing fields
- The available field types (see below)

Your response should ONLY be a valid JSON object like:
{
  "fields": {
    "slug": { "type": "core/text", "label": "Slug" },
    "seo": {
      "type": "core/structure",
      "label": "SEO Metadata",
      "schema": "core/seo"
    }
  }
}

⚠️ RULES:
- DO NOT delete or modify existing fields
- Use the field types exactly as defined below
- Use meaningful \`label\` values
- If appropriate, include \`meta\`, \`options\`, or \`schema\`
- All returned field keys must be unique
- Avoid prefixing the fields

Available field types:
${availableFieldTypes}
`;

        const userContent = `Prompt:\n${prompt}\n\nCurrent fields:\n${JSON.stringify(currentFields, null, 2)}`;
        const content = await adapter.generate(userContent, {
            system: systemPrompt,
            temperature: 0.4,
            maxTokens: 2048
        });
        if (!content?.trim()) throw new Error('Empty response from AI');

        const parsed = JSON.parse(content.trim());
        const mergedFields = { ...currentFields, ...parsed.fields };

        return res.json({ fields: mergedFields });
    } catch (err: any) {
        console.error('AI generate/fields failed:', err);
        return res.status(500).json({ error: err.message || 'AI field generation failed' });
    }
});

export const openapi: Record<string, OpenAPIV3.PathItemObject> = {
    '/generate/fields': {
        post: {
            summary: 'Generate field definitions using AI',
            tags: ['AI'],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                prompt: { type: 'string' },
                                currentFields: { type: 'object', additionalProperties: true }
                            },
                            required: ['prompt', 'currentFields']
                        }
                    }
                }
            },
            responses: {
                '200': { description: 'Fields generated' },
                '503': { description: 'AI disabled' }
            }
        }
    }
};

export default router;
