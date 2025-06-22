import { Field } from '@moteur/types/Field';
import { RenderOptions } from '@moteur/types/Renderer';
import { renderAttributesFromMeta } from '../../../../utils/renderAttributesFromMeta';

export function renderRichTextField(value: any, options: RenderOptions, field: Field): string {
    const attrs = renderAttributesFromMeta(field.meta);
    const html = typeof value === 'object' ? (value[options.locale] ?? '') : value;
    return `<div class="rich-text"${attrs}>${html}</div>`;
}
