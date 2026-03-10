import { describe, it, expect } from 'vitest';
import { validatePage } from '../../src/validators/validatePage.js';
import type { TemplateSchema } from '@moteur/types/Template.js';

describe('validatePage', () => {
    const schema: TemplateSchema = {
        id: 'landing',
        projectId: 'p1',
        label: 'Landing',
        fields: {
            title: {
                type: 'core/text',
                label: 'Title',
                options: { required: true }
            },
            body: {
                type: 'core/text',
                label: 'Body',
                options: { required: false }
            }
        },
        createdAt: '',
        updatedAt: ''
    };

    it('returns valid when required fields are present', () => {
        const page = {
            id: 'page1',
            fields: { title: 'Hello', body: 'World' }
        };
        const result = validatePage(page, schema);
        expect(result.valid).toBe(true);
        expect(result.issues).toHaveLength(0);
    });

    it('returns invalid when required field is missing', () => {
        const page = {
            id: 'page1',
            fields: { body: 'Only body' }
        };
        const result = validatePage(page, schema);
        expect(result.valid).toBe(false);
        expect(
            result.issues.some(
                i => i.code === 'PAGE_MISSING_REQUIRED_FIELD' && i.message?.includes('title')
            )
        ).toBe(true);
    });

    it('returns invalid when required field is empty string', () => {
        const page = {
            id: 'page1',
            fields: { title: '', body: 'x' }
        };
        const result = validatePage(page, schema);
        expect(result.valid).toBe(false);
    });

    it('accepts optional field missing', () => {
        const page = {
            id: 'page1',
            fields: { title: 'Hi' }
        };
        const result = validatePage(page, schema);
        expect(result.valid).toBe(true);
    });

    it('returns valid for schema with no required fields', () => {
        const minimalSchema: TemplateSchema = {
            id: 'min',
            projectId: 'p1',
            label: 'Min',
            fields: {
                x: { type: 'core/text', label: 'X', options: {} }
            },
            createdAt: '',
            updatedAt: ''
        };
        const page = {
            id: 'page1',
            fields: {} as Record<string, unknown>
        };
        const result = validatePage(page, minimalSchema);
        expect(result.valid).toBe(true);
    });
});
