import { Field } from '@moteur/types/Field.js';
import { RenderOptions } from '@moteur/types/Renderer.js';
import { renderFallbackField } from './rendererFallbackField.js';
import { renderBooleanField } from './fields/core/renderBooleanField.js';
import { renderColorField } from './fields/core/renderColorField.js';
import { renderImageField } from './fields/core/renderImageField.js';
import { renderLinkField } from './fields/core/renderLinkField.js';
import { renderListField } from './fields/core/renderListField.js';
import { renderMarkdownField } from './fields/core/renderMarkdownField.js';
import { renderNumberField } from './fields/core/renderNumberField.js';
import { renderObjectField } from './fields/core/renderObjectField.js';
import { renderRichTextField } from './fields/core/renderRichTextField.js';
import { renderSelectField } from './fields/core/renderSelectField.js';
//import { renderTextAreaField } from './fields/core/renderTextAreaField.js';

import { renderTextField } from './fields/core/renderTextField.js';

const fieldRenderers: Record<string, (value: any, options: RenderOptions, field: Field) => string> =
    {
        'core/boolean': renderBooleanField,
        'core/color': renderColorField,
        'core/image': renderImageField,
        'core/link': renderLinkField,
        'core/list': renderListField,
        'core/markdown': renderMarkdownField,
        'core/number': renderNumberField,
        'core/object': renderObjectField,
        'core/select': renderSelectField,
        'core/rich-text': renderRichTextField,
        'core/text': renderTextField
    };

export function renderField(
    type: string,
    value: any,
    options: RenderOptions,
    fieldSchema: Field
): string {
    if (!type) {
        throw new Error('Field type is required for rendering.');
    }

    const renderer = fieldRenderers[type];
    if (!renderer) {
        console.warn(`No renderer found for field type "${type}". Falling back.`);
    }

    return renderer
        ? renderer(value, options, fieldSchema)
        : renderFallbackField(value, options, fieldSchema);
}
