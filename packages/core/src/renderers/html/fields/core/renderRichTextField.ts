import { Field } from '@moteur/types/Field.js';
import { RenderOptions } from '@moteur/types/Renderer.js';
import { renderAttributesFromMeta } from '../../../../utils/renderAttributesFromMeta.js';

export function renderRichTextField(value: any, options: RenderOptions, field: Field): string {
    const attrs = renderAttributesFromMeta(field.meta);
    const html = typeof value === 'object' ? (value[options.locale] ?? '') : value;
    return `<div class="rich-text"${attrs}>${html}</div>`;
}
