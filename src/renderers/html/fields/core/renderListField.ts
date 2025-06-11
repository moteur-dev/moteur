import { Field } from '../../../../types/Field';
import { RenderOptions } from '../../../../types/Renderer';
import { renderAttributesFromMeta } from '../../../../utils/renderAttributesFromMeta';
import { renderField } from '../../htmlFieldRenderer';

export function renderListField(value: any, options: RenderOptions, field: Field): string {
    if (!Array.isArray(value) || value.length === 0) {
        return '';
    }

    const itemField = field.options?.items as Field;
    if (!itemField || typeof itemField !== 'object' || typeof itemField.type !== 'string') {
        console.warn('Invalid or missing "items" field in list definition:', field);
        return '';
    }

    const metaAttrs = renderAttributesFromMeta(field.meta);
    const sortableClass = field.options?.sortable ? 'list--sortable' : '';

    const itemsHtml = value
        .map(itemValue => {
            const rendered = renderField(itemField.type, itemValue, options, itemField);
            return `<li class="list-item">${rendered}</li>`;
        })
        .join('\n');

    return `
    <ul class="list-field ${sortableClass}"${metaAttrs}>
      ${itemsHtml}
    </ul>
  `.trim();
}
