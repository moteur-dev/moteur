import { Router } from 'express';
import { updateEntry } from '@moteur/core/entries.js';
import { getModelSchema } from '@moteur/core/models.js';
import { validateEntry } from '@moteur/core/validators/validateEntry.js';
import type { OpenAPIV3 } from 'openapi-types';
import { requireProjectAccess } from '../middlewares/auth.js';

const router: Router = Router({ mergeParams: true });

router.patch('/:entryId', requireProjectAccess, async (req: any, res: any) => {
    const { projectId, modelId, entryId } = req.params;

    if (!projectId || !modelId || !entryId) {
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
        const entry = await updateEntry(req.user!, projectId, modelId, entryId, req.body);
        return res.json(entry);
    } catch (err: any) {
        return res.status(400).json({ error: err.message });
    }
});

export const openapi: Record<string, OpenAPIV3.PathItemObject> = {
    '/projects/{projectId}/models/{modelId}/entries/{entryId}': {
        patch: {
            summary: 'Update an entry',
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
                },
                {
                    name: 'entryId',
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
                '200': {
                    description: 'Entry updated',
                    content: {
                        'application/json': {
                            schema: { type: 'object' }
                        }
                    }
                },
                '400': {
                    description: 'Validation failed or bad input',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ValidationResult' }
                        }
                    }
                }
            }
        }
    }
};

export default router;
