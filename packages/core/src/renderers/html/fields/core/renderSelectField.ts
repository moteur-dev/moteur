import { Field } from '@moteur/types/Field';
import { RenderOptions } from '@moteur/types/Renderer';
import { renderAttributesFromMeta } from '../../../../utils/renderAttributesFromMeta';

export function renderSelectField(value: any, options: RenderOptions, field: Field): string {
    const selected = value?.value;
    if (!selected || !field.options?.choices) return '';

    const attrs = renderAttributesFromMeta(field.meta);
    const choices = field.options.choices as Array<any>;
    const multiple = field.options.multiple === true;

    const matchLabel = (val: string) => {
        const choice = choices.find(c => c.value === val);
        return choice?.label?.[options.locale] || choice?.value || val;
    };

    let rendered: string;

    if (multiple && Array.isArray(selected)) {
        const labels = selected.map(matchLabel).join(', ');
        rendered = `<span class="select-values">${labels}</span>`;
    } else if (typeof selected === 'string') {
        const label = matchLabel(selected);
        rendered = `<span class="select-value">${label}</span>`;
    } else {
        return '';
    }

    return `<div class="select-field"${attrs}>${rendered}</div>`;
}
