import { describe, it, expect } from 'vitest';
import { validateJsonField } from '../../../../src/validators/fields/core/validateJsonField.js';
import { Field } from '@moteur/types/Field.js';

describe('validateJsonField', () => {
    const field: Field = { type: 'core/json', label: 'Data' };

    it('validates valid JSON object', () => {
        expect(validateJsonField({ a: 1 }, field, 'data.json')).toEqual([]);
    });

    it('validates valid JSON string', () => {
        expect(validateJsonField('{"a":1}', field, 'data.json')).toEqual([]);
    });

    it('returns error for invalid JSON string', () => {
        const issues = validateJsonField('{invalid}', field, 'data.json');
        expect(issues).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    code: 'JSON_INVALID',
                    message: 'Value is not valid JSON.'
                })
            ])
        );
    });

    it('allows empty when allowEmpty is true', () => {
        const f: Field = { type: 'core/json', label: 'Data', options: { allowEmpty: true } };
        expect(validateJsonField(null, f, 'data.json')).toEqual([]);
        expect(validateJsonField('', f, 'data.json')).toEqual([]);
    });

    it('returns error for null when allowEmpty is false', () => {
        const issues = validateJsonField(null, field, 'data.json');
        expect(issues[0].code).toBe('JSON_EMPTY');
    });
});
