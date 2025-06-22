import { validateDateTimeField } from '../../../../src/validators/fields/core/validateDatetimeField.js';
import { Field } from '@moteur/types/Field.js';

describe('validateDateTimeField', () => {
  const field: Field = { type: 'core/datetime', label: 'Date' };

  it('validates ISO8601 date', () => {
    const issues = validateDateTimeField('2024-01-01T12:00:00Z', field, 'data.date');
    expect(issues).toEqual([]);
  });

  it('errors for non-date string', () => {
    const issues = validateDateTimeField('note-a-date', field, 'data.date');
    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'error' })
      ])
    );
  });

  it('errors for non-string, invalid date type', () => {
    const issues = validateDateTimeField(false, field, 'data.date');
    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'error' })
      ])
    );
  });
});