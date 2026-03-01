import express, { Router } from 'express';
import { OpenAPIV3 } from 'openapi-types';
import { getProject } from '@moteur/core/projects.js';
import { getModelSchema } from '@moteur/core/models.js';
// import { validateEntry } from '@moteur/core/validators/validateEntry.js';
import { requireProjectAccess } from '../middlewares/auth.js';

const router: Router = express.Router();

/** Lazy loader for OpenAI client */
async function getOpenAI() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return null;

    const { OpenAI } = await import('openai');
    return new OpenAI({ apiKey });
}

/** Format model fields into a list for prompt context */
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

router.post('/generate-entry', requireProjectAccess, async (req: any, res: any) => {
    const { prompt, projectId, modelId, locale: _locale = 'en' } = req.body;

    if (!prompt || !projectId || !modelId) {
        return res
            .status(400)
            .json({ error: 'Missing required parameters: prompt, projectId, modelId' });
    }

    // Soft dependency check
    const openai = await getOpenAI();
    if (!openai) {
        console.warn('[AI] OpenAI disabled: no OPENAI_API_KEY found.');
        return res.status(503).json({
            error: 'AI entry generation is disabled (missing OPENAI_API_KEY)'
        });
    }

    try {
        const _project = await getProject(req.user!, projectId);
        const model = await getModelSchema(req.user!, projectId, modelId);

        const fieldList = formatFieldListForPrompt(model.fields);

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

User prompt:
${prompt}

Model fields:
${fieldList}
`.trim();

        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt }
            ],
            temperature: 0.6
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) throw new Error('Empty response from AI');

        const parsed = JSON.parse(content);
        parsed.type = modelId;

        /* Optionally validate:
        const validation = validateEntry(parsed, model);
        if (!validation.valid) {
            return res.status(400).json({
                error: 'Invalid AI-generated entry',
                issues: validation.issues
            });
        }
        */

        return res.json({ success: true, entry: parsed });
    } catch (err: any) {
        console.error('AI generate-entry failed:', err);
        return res.status(500).json({ error: 'AI entry generation failed' });
    }
});

export const openapi: Record<string, OpenAPIV3.PathItemObject> = {
    '/generate-entry': {
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
                                prompt: {
                                    type: 'string',
                                    description:
                                        'User-provided description of the content to generate',
                                    example:
                                        'Create a product entry for an eco-friendly water bottle'
                                },
                                projectId: {
                                    type: 'string',
                                    description: 'ID of the current project'
                                },
                                modelId: {
                                    type: 'string',
                                    description: 'ID of the model schema to use'
                                },
                                locale: {
                                    type: 'string',
                                    description: 'Locale to use for multilingual fields',
                                    example: 'en',
                                    default: 'en'
                                }
                            },
                            required: ['prompt', 'projectId', 'modelId']
                        }
                    }
                }
            },
            responses: {
                '200': {
                    description: 'Entry successfully generated',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: true },
                                    entry: {
                                        type: 'object',
                                        properties: {
                                            data: {
                                                type: 'object',
                                                description: 'Generated entry data, keyed by field',
                                                additionalProperties: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                '400': {
                    description: 'Bad Request (missing or invalid parameters)',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    error: { type: 'string' },
                                    issues: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                type: { type: 'string' },
                                                code: { type: 'string' },
                                                message: { type: 'string' },
                                                path: { type: 'string' },
                                                hint: { type: 'string' }
                                            }
                                        }
                                    }
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
