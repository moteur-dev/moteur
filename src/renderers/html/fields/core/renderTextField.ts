import { Field } from '../../../../types/Field';
import { RenderOptions } from '../../../../types/Renderer';
import { renderAttributesFromMeta } from '../../../../utils/renderAttributesFromMeta';

export function renderTextField(value: any, options: RenderOptions, field: Field): string {
    if (!field) {
        throw new Error('Field is required');
    }

    const attrs = renderAttributesFromMeta(field.meta);
    const isMultilingual = field.options?.multilingual === true;

    if (value == null || value === '') return '';

    if (isMultilingual) {
        console.log('renderTextField: multilingual field detected', field);
        console.log(value);
        if (typeof value === 'object' && value[options.locale]) {
            return `<span${attrs}>${value[options.locale]}</span>`;
        }

        if (typeof value === 'string') {
            return `<span${attrs}>${value}</span>`; // fallback: untranslated string
        }

        return '';
    }

    if (typeof value === 'string' || typeof value === 'number') {
        return `<span${attrs}>${String(value)}</span>`;
    }

    return '';
}
