import { Field } from '@moteur/types/Field.js';
import { RenderOptions } from '@moteur/types/Renderer.js';
import { renderField } from '../../htmlFieldRenderer.js';
import { renderAttributesFromMeta } from '../../../../utils/renderAttributesFromMeta.js';

export function renderObjectField(value: any, options: RenderOptions, field: Field): string {
    if (!value || typeof value !== 'object') return '';

    const fields = field.data ?? {};
    const htmlParts: string[] = [];
    const attrs = renderAttributesFromMeta(field.meta);

    for (const [key, fieldDef] of Object.entries(fields) as [string, Field][]) {
        const fieldValue = value[key];
        const fieldType = fieldDef.type;
        const rendered = renderField(fieldType, fieldValue, options, fieldDef);
        htmlParts.push(`<div class="object-field object-field--${key}">${rendered}</div>`);
    }

    return `
    <div class="object-group"${attrs}>
      <div class="object-children">
        ${htmlParts.join('\n')}
      </div>
    </div>
  `.trim();
}
