import { Field } from '@moteur/types/Field';
import { RenderOptions } from '@moteur/types/Renderer';
import { renderAttributesFromMeta } from '../../../../utils/renderAttributesFromMeta';

export function renderNumberField(value: any, options: RenderOptions, field: Field): string {
    if (value?.value == null || isNaN(value.value)) {
        return '';
    }

    const attrs = renderAttributesFromMeta(field.meta);
    return `<span class="number-field"${attrs}>${value.value}</span>`;
}
