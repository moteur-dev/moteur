import { Field } from '../../../../types/Field';
import { RenderOptions } from '../../../../types/Renderer';
import { renderField } from '../../htmlFieldRenderer';
import { renderAttributesFromMeta } from '../../../../utils/renderAttributesFromMeta';

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
