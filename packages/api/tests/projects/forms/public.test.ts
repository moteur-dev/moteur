import request from 'supertest';
import express from 'express';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@moteur/core/forms.js', () => ({
    getFormForProject: vi.fn()
}));
vi.mock('@moteur/core/formSubmissions.js', () => ({
    createSubmission: vi.fn()
}));

import formsPublicRouter from '../../../src/projects/forms/public.js';
import { getFormForProject } from '@moteur/core/forms.js';
import { createSubmission } from '@moteur/core/formSubmissions.js';

const app = express();
app.use(express.json());
app.use('/projects/:projectId/forms', formsPublicRouter);

describe('GET /projects/:projectId/forms/:formId (public)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns public form payload without actions, notifications, recaptcha', async () => {
        const mockForm = {
            id: 'contact',
            label: 'Contact',
            description: 'Reach out',
            fields: { email: { type: 'core/text', label: 'Email', options: {} } },
            status: 'active',
            submitLabel: { en: 'Send' },
            successMessage: { en: 'Thanks!' },
            redirectUrl: 'https://example.com/thanks',
            honeypot: true,
            actions: [{ type: 'email', to: ['a@b.com'], subject: '', body: '' }],
            notifications: {},
            recaptcha: { siteKey: 'x', secretKey: 'y' },
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z'
        };
        (getFormForProject as any).mockResolvedValue(mockForm);

        const res = await request(app).get('/projects/demo/forms/contact');

        expect(res.status).toBe(200);
        expect(res.body.form).toBeDefined();
        expect(res.body.form.id).toBe('contact');
        expect(res.body.form.label).toBe('Contact');
        expect(res.body.form.fields).toEqual(mockForm.fields);
        expect(res.body.form.actions).toBeUndefined();
        expect(res.body.form.notifications).toBeUndefined();
        expect(res.body.form.recaptcha).toBeUndefined();
        expect(res.body.form.createdAt).toBeUndefined();
        expect(res.body.form.updatedAt).toBeUndefined();
    });

    it('returns 404 when form not found', async () => {
        (getFormForProject as any).mockResolvedValue(null);

        const res = await request(app).get('/projects/demo/forms/missing');

        expect(res.status).toBe(404);
        expect(res.body.error).toContain('not found');
    });

    it('returns 403 when form status is not active', async () => {
        (getFormForProject as any).mockResolvedValue({
            id: 'archived',
            label: 'Archived',
            status: 'archived',
            fields: {},
            honeypot: true
        });

        const res = await request(app).get('/projects/demo/forms/archived');

        expect(res.status).toBe(403);
        expect(res.body.error).toContain('not active');
    });
});

describe('POST /projects/:projectId/forms/:formId/submit (public)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns success with submissionId, message, and optional redirectUrl', async () => {
        const mockForm = {
            id: 'contact',
            label: 'Contact',
            status: 'active',
            fields: {},
            successMessage: { en: 'Thank you!' },
            redirectUrl: '/thanks',
            honeypot: true
        };
        (getFormForProject as any).mockResolvedValue(mockForm);
        (createSubmission as any).mockResolvedValue({
            id: 'sub-123',
            formId: 'contact',
            projectId: 'demo',
            data: { email: 'a@b.com' },
            metadata: {},
            actionResults: [],
            status: 'received'
        });

        const res = await request(app)
            .post('/projects/demo/forms/contact/submit')
            .send({ email: 'a@b.com' });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.submissionId).toBe('sub-123');
        expect(res.body.message).toBe('Thank you!');
        expect(res.body.redirectUrl).toBe('/thanks');
        expect(createSubmission).toHaveBeenCalledWith(
            'demo',
            'contact',
            { email: 'a@b.com' },
            expect.objectContaining({
                submittedAt: expect.any(String),
                honeypotTriggered: false
            })
        );
    });

    it('strips keys starting with _ from submission data', async () => {
        (getFormForProject as any).mockResolvedValue({
            id: 'contact',
            label: 'Contact',
            status: 'active',
            fields: {},
            honeypot: true
        });
        (createSubmission as any).mockResolvedValue({ id: 's1', status: 'received' } as any);

        await request(app)
            .post('/projects/demo/forms/contact/submit')
            .send({ email: 'a@b.com', _honeypot: '', _locale: 'en' });

        expect(createSubmission).toHaveBeenCalledWith(
            'demo',
            'contact',
            { email: 'a@b.com' },
            expect.any(Object)
        );
    });

    it('returns 404 when form not found', async () => {
        (getFormForProject as any).mockResolvedValue(null);

        const res = await request(app).post('/projects/demo/forms/missing/submit').send({});

        expect(res.status).toBe(404);
        expect(createSubmission).not.toHaveBeenCalled();
    });

    it('returns 403 when form is not active', async () => {
        (getFormForProject as any).mockResolvedValue({
            id: 'inactive',
            status: 'inactive',
            fields: {},
            honeypot: true
        });

        const res = await request(app).post('/projects/demo/forms/inactive/submit').send({});

        expect(res.status).toBe(403);
        expect(createSubmission).not.toHaveBeenCalled();
    });
});
