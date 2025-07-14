import express, { Router } from 'express';
import fieldRegistry from '@moteur/core/registry/FieldRegistry.js';
import { OpenAPIV3 } from 'openapi-types';
import { OpenAI } from 'openai';
import { requireAdmin } from '../middlewares/auth.js';

const router: Router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

/** Reduce full field definitions to essentials */
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

router.post('/generate-fields', requireAdmin, async (req: any, res: any) => {
    const { prompt, currentFields } = req.body;

    if (!prompt || typeof currentFields !== 'object') {
        return res.status(400).json({ error: 'Missing or invalid prompt / currentFields' });
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
        console.log('System prompt:', systemPrompt);

        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                { role: 'system', content: systemPrompt },
                {
                    role: 'user',
                    content: `Prompt:\n${prompt}\n\nCurrent fields:\n${JSON.stringify(currentFields, null, 2)}`
                }
            ],
            temperature: 0.4
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) throw new Error('Empty response from AI');

        const parsed = JSON.parse(content);
        const mergedFields = { ...currentFields, ...parsed.fields };

        return res.json({ fields: mergedFields });
    } catch (err: any) {
        console.error('AI generation failed:', err);
        return res.status(500).json({ error: 'AI field generation failed' });
    }
});

export const openapi: Record<string, OpenAPIV3.PathItemObject> = {
    '/generate-fields': {
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
                                prompt: {
                                    type: 'string',
                                    description: 'User-provided description of the model',
                                    example: 'Create fields for a blog post'
                                },
                                currentFields: {
                                    type: 'object',
                                    description: 'Current field definitions (keyed by field name)',
                                    additionalProperties: {
                                        type: 'object',
                                        properties: {
                                            type: { type: 'string' },
                                            label: { type: 'string' }
                                        },
                                        required: ['type']
                                    }
                                }
                            },
                            required: ['prompt', 'currentFields']
                        }
                    }
                }
            },
            responses: {
                '200': {
                    description: 'Field definitions successfully generated',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    fields: {
                                        type: 'object',
                                        additionalProperties: {
                                            type: 'object',
                                            properties: {
                                                type: { type: 'string' },
                                                label: { type: 'string' },
                                                meta: { type: 'object' },
                                                schema: { type: 'string' }
                                            },
                                            required: ['type']
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                '400': {
                    description: 'Bad Request (invalid input)',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    error: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                '500': {
                    description: 'Internal Server Error (AI failure)',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    error: { type: 'string' }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};

export default router;
