import { options } from 'marked';
import { renderTextField } from '../../../../renderers/html/fields/core/renderTextField.js';

const field = {
    type: 'core/text',
    label: 'Text',
    options: { multilingual: false }
};
const multilingualField = {
    type: 'core/text',
    label: 'Multilingual Text',
    options: { multilingual: true }
};

describe('renderTextField', () => {
    it('renders a plain string', () => {
        const output = renderTextField('Hello', { locale: 'en' }, field);
        expect(output).toContain('Hello');
    });

    it('renders multilingual string', () => {
        const output = renderTextField(
            { en: 'Hi', fr: 'Salut' },
            { locale: 'fr' },
            multilingualField
        );
        expect(output).toContain('Salut');
    });

    it('returns empty string on unknown locale', () => {
        const output = renderTextField({ fr: 'Salut' }, { locale: 'es' }, multilingualField);
        expect(output).toBe('');
    });

    it('returns empty string for null or undefined', () => {
        const output = renderTextField(null, { locale: 'en' }, field);
        expect(output).toBe('');
    });

    it('returns empty string for undefined', () => {
        const output = renderTextField(undefined, { locale: 'en' }, field);
        expect(output).toBe('');
    });

    it('returns empty string for empty array', () => {
        const output = renderTextField([], { locale: 'en' }, field);
        expect(output).toBe('');
    });

    it('returns empty string for empty object', () => {
        const output = renderTextField({}, { locale: 'en' }, field);
        expect(output).toBe('');
    });

    it('returns stringified number', () => {
        const output = renderTextField(123, { locale: 'en' }, field);
        expect(output).toContain('123');
    });

    it('returns empty string for boolean', () => {
        let output = renderTextField(true, { locale: 'en' }, field);
        expect(output).toBe('');
        output = renderTextField(false, { locale: 'en' }, field);
        expect(output).toBe('');
    });
});
