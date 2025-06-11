import { Field } from '../../../../types/Field';
import { RenderOptions } from '../../../../types/Renderer';
import { renderAttributesFromMeta } from '../../../../utils/renderAttributesFromMeta';

export function renderColorField(value: any, options: RenderOptions, field: Field): string {
    const hex = value?.value;
    if (!hex) return '';

    const meta = value?.meta ?? {};
    const attrs = renderAttributesFromMeta(field.meta);
    const showSwatch = field.options?.showSwatch !== false;

    const swatch = showSwatch
        ? `<span class="swatch" style="background-color: ${hex}; display: inline-block; width: 1em; height: 1em; border: 1px solid #ccc; vertical-align: middle; margin-right: 0.5em;"></span>`
        : '';

    return `
    <span class="color-field" ${attrs}>
        ${swatch}<span class="color-code">${hex}</span>
    </span>
    `;
}
