import { Field } from '@moteur/types/Field';
import { RenderOptions } from '@moteur/types/Renderer';
import { renderAttributesFromMeta } from '../../../../utils/renderAttributesFromMeta';

export function renderBooleanField(value: any, options: RenderOptions, field: Field): string {
    const meta = value?.meta ?? {};
    const attrs = renderAttributesFromMeta(meta);
    const isChecked = value === true;

    const trueLabel = field.options?.trueLabel ?? 'Yes';
    const falseLabel = field.options?.falseLabel ?? 'No';
    const displayLabel = isChecked ? trueLabel : falseLabel;

    return `
      <span class="boolean" ${attrs}>
        ${displayLabel}
      </span>
    `;
}
