import { Field } from '@moteur/types/Field';
import { RenderOptions } from '@moteur/types/Renderer';
import { StructureRegistry } from '../../../../registry/StructureRegistry';
import { renderField } from '../../htmlFieldRenderer';
import { renderAttributesFromMeta } from '../../../../utils/renderAttributesFromMeta';

const structureRegistry = new StructureRegistry();

export function renderStructureField(value: any, options: RenderOptions, schema: Field): string {
    if (!value || typeof value !== 'object') return '';

    const fields = schema.data ?? {};
    const htmlParts: string[] = [];
    const attrs = renderAttributesFromMeta(schema.meta);

    // Load schema: inline or by reference
    const structureSchema =
        typeof value.schema === 'string' ? structureRegistry.get(value.schema) : value.schema;

    if (!structureSchema || typeof structureSchema.fields !== 'object') {
        return '';
    }

    // Custom renderer defined by structure
    /*if (structureSchema.renderer) {
    const custom = getObjectFieldRenderer(structureSchema.renderer);
    if (custom) return custom(value, options, structureSchema);
  }*/

    // Generic rendering fallback
    for (const [key, fieldDef] of Object.entries(fields)) {
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
  `;
}
