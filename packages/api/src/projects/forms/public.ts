import { Router, Request, Response } from 'express';
import express from 'express';
import type { OpenAPIV3 } from 'openapi-types';
import type { FormSchema, MultilingualString } from '@moteur/types/Form.js';
import { getFormForProject } from '@moteur/core/forms.js';
import { createSubmission } from '@moteur/core/formSubmissions.js';
import type { FormSubmissionMeta } from '@moteur/types/Form.js';
import { formsSubmitRateLimiter } from '../../middlewares/rateLimit.js';
import { stripUiFromFieldOptions } from '../../utils/stripUiFromFields.js';

const router: Router = Router({ mergeParams: true });

/** Pick message in requested locale or first available. */
function getMessage(msg: MultilingualString | undefined, locale?: string): string {
    if (!msg || typeof msg !== 'object') return 'Thank you for your submission.';
    if (locale && msg[locale]) return msg[locale];
    const first = Object.values(msg)[0];
    return typeof first === 'string' ? first : 'Thank you for your submission.';
}

/** Public form payload: explicit allowlist; omit actions, notifications, recaptcha, createdAt, updatedAt. ui is stripped from field options. */
function toPublicForm(form: FormSchema): Record<string, unknown> {
    const fields = form.fields
        ? Object.fromEntries(
              Object.entries(form.fields).map(([k, f]) => [
                  k,
                  { ...f, options: stripUiFromFieldOptions(f.options as Record<string, unknown>) }
              ])
          )
        : form.fields;
    const out: Record<string, unknown> = {
        id: form.id,
        label: form.label,
        description: form.description,
        fields,
        submitLabel: form.submitLabel,
        successMessage: form.successMessage,
        honeypot: form.honeypot ?? true
    };
    if (form.redirectUrl != null && form.redirectUrl !== '') {
        out.redirectUrl = form.redirectUrl;
    }
    return out;
}

// GET /projects/:projectId/forms/:formId — public form metadata
router.get('/:formId', async (req: Request, res: Response): Promise<void> => {
    const { projectId, formId } = req.params;
    if (!projectId || !formId) {
        res.status(400).json({ error: 'Missing projectId or formId' });
        return;
    }
    try {
        const form = await getFormForProject(projectId, formId);
        if (!form) {
            res.status(404).json({ error: 'Form not found' });
            return;
        }
        if (form.status !== 'active') {
            res.status(403).json({ error: 'Form is not active' });
            return;
        }
        res.json({ form: toPublicForm(form) });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to get form';
        res.status(500).json({ error: message });
    }
});

// POST /projects/:projectId/forms/:formId/submit — submit (no auth)
// urlencoded scoped to this route only; rate limit by projectId+formId
router.post(
    '/:formId/submit',
    express.urlencoded({ extended: false }),
    formsSubmitRateLimiter,
    async (req: Request, res: Response): Promise<void> => {
        const { projectId, formId } = req.params;
        if (!projectId || !formId) {
            res.status(400).json({ error: 'Missing projectId or formId' });
            return;
        }
        try {
            const form = await getFormForProject(projectId, formId);
            if (!form) {
                res.status(404).json({ error: 'Form not found' });
                return;
            }
            if (form.status !== 'active') {
                res.status(403).json({ error: 'Form is not active' });
                return;
            }

            const body = req.body ?? {};
            const honeypotValue = body._honeypot;
            const honeypotTriggered =
                form.honeypot !== false &&
                honeypotValue !== undefined &&
                honeypotValue !== null &&
                String(honeypotValue).trim() !== '';

            const locale = (req.query.locale as string) || body._locale || undefined;

            const meta: FormSubmissionMeta = {
                submittedAt: new Date().toISOString(),
                ip: req.ip,
                userAgent: req.headers['user-agent'],
                locale: locale || undefined,
                honeypotTriggered
            };

            const cleanData: Record<string, unknown> = {};
            for (const [key, value] of Object.entries(body)) {
                if (key.startsWith('_')) continue;
                cleanData[key] = value;
            }

            const submission = await createSubmission(projectId, formId, cleanData, meta);

            const message = getMessage(form.successMessage, locale);

            res.status(200).json({
                success: true,
                submissionId: submission.id,
                message,
                ...(form.redirectUrl ? { redirectUrl: form.redirectUrl } : {})
            });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Submission failed';
            res.status(500).json({ error: message });
        }
    }
);

export const openapi: Record<string, OpenAPIV3.PathItemObject> = {
    '/projects/{projectId}/forms/{formId}': {
        get: {
            summary: 'Get public form metadata (fields, labels, successMessage)',
            tags: ['Forms (Public)'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'formId', in: 'path', required: true, schema: { type: 'string' } }
            ],
            responses: {
                '200': { description: 'Form (public payload)' },
                '403': { description: 'Form inactive' },
                '404': { description: 'Not found' }
            }
        }
    },
    '/projects/{projectId}/forms/{formId}/submit': {
        post: {
            summary: 'Submit a form (JSON or urlencoded). Rate limited per form.',
            tags: ['Forms (Public)'],
            parameters: [
                { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'formId', in: 'path', required: true, schema: { type: 'string' } },
                { name: 'locale', in: 'query', required: false, schema: { type: 'string' } }
            ],
            requestBody: {
                content: {
                    'application/json': { schema: { type: 'object' } },
                    'application/x-www-form-urlencoded': { schema: { type: 'object' } }
                }
            },
            responses: {
                '200': {
                    description: 'Success',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean' },
                                    submissionId: { type: 'string' },
                                    message: { type: 'string' },
                                    redirectUrl: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                '403': { description: 'Form inactive' },
                '404': { description: 'Form not found' },
                '429': { description: 'Too many submissions' }
            }
        }
    }
};

export default router;
