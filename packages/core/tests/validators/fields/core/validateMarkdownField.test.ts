import { describe, it, expect } from 'vitest';
import { validateMarkdownField } from '../../../../src/validators/fields/core/validateMarkdownField.js';
import { Field } from '@moteur/types/Field.js';

describe('validateMarkdownField', () => {
    const field: Field = { type: 'core/markdown', label: 'Content' };

    it('validates string as valid markdown', () => {
        const issues = validateMarkdownField('# Hello\n\nWorld', field, 'data.content');
        expect(issues).toEqual([]);
    });

    it('validates empty string', () => {
        const issues = validateMarkdownField('', field, 'data.content');
        expect(issues).toEqual([]);
    });

    it('returns error for non-string value', () => {
        const issues = validateMarkdownField(123, field, 'data.content');
        expect(issues).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    type: 'error',
                    code: 'MARKDOWN_INVALID_TYPE',
                    message: 'Expected a markdown string.'
                })
            ])
        );
    });

    it('returns error for null', () => {
        const issues = validateMarkdownField(null, field, 'data.content');
        expect(issues).toHaveLength(1);
        expect(issues[0].code).toBe('MARKDOWN_INVALID_TYPE');
    });

    it('returns error for object', () => {
        const issues = validateMarkdownField({ en: 'Hello' }, field, 'data.content');
        expect(issues).toHaveLength(1);
        expect(issues[0].code).toBe('MARKDOWN_INVALID_TYPE');
    });
});
