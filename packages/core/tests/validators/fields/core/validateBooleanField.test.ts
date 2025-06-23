import { validateBooleanField } from '../../../../src/validators/fields/core/validateBooleanField.js';
import { Field } from '@moteur/types/Field.js';

describe('validateBooleanField', () => {
    const field: Field = { type: 'core/boolean', label: 'Flag' };

    it('validates true as a valid boolean', () => {
        const issues = validateBooleanField(true, field, 'data.flag');
        expect(issues).toHaveLength(0);
    });

    it('returns error for non-boolean', () => {
        const issues = validateBooleanField('yes', field, 'data.flag');
        expect(issues).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    type: 'error',
                    code: 'INVALID_BOOLEAN_TYPE'
                })
            ])
        );
    });
});
