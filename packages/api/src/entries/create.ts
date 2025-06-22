import { Router } from 'express';
import { createEntry } from '@moteur/core/entries';
import { validateEntry } from '@moteur/core/validators/validateEntry';
import type { OpenAPIV3 } from 'openapi-types';
import { getModelSchema } from '@moteur/core/models';
import { requireProjectAccess } from '../middlewares/auth';

const router = Router({ mergeParams: true });

const handler = async (req: any, res: any) => {
    const { projectId, modelId } = req.params;

    if (!projectId || !modelId) {
        return res.status(400).json({ error: 'Missing path parameters' });
    }

    const modelSchema = getModelSchema(req.user!, projectId, modelId);
    if (!modelSchema) {
        return res.status(404).json({ error: 'Model not found' });
    }

    const validation = validateEntry(req.body, modelSchema);
    if (!validation.valid) {
        return res.status(400).json({
            valid: false,
            errors: validation.issues.map((issue: any) => ({
                field: issue.path,
                message: issue.message
            }))
        });
    }

    try {
        const entry = await createEntry(req.user!, projectId, modelId, req.body);
        return res.status(201).json(entry);
    } catch (err: any) {
        return res.status(400).json({ error: err.message });
    }
};

router.post('/', requireProjectAccess, handler);

export const openapi: Record<string, OpenAPIV3.PathItemObject> = {
    '/projects/{projectId}/models/{modelId}/entries': {
        post: {
            summary: 'Create a new entry',
            tags: ['Entries'],
            parameters: [
                {
                    name: 'projectId',
                    in: 'path',
                    required: true,
                    schema: { type: 'string' }
                },
                {
                    name: 'modelId',
                    in: 'path',
                    required: true,
                    schema: { type: 'string' }
                }
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            additionalProperties: true
                        }
                    }
                }
            },
            responses: {
                '201': {
                    description: 'Entry created',
                    content: {
                        'application/json': {
                            schema: { type: 'object' }
                        }
                    }
                },
                '400': {
                    description: 'Validation failed or invalid input',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ValidationResult'
                            }
                        }
                    }
                }
            }
        }
    }
};

export default router;
