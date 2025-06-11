import { Field } from '../../types/Field';
import { RenderOptions } from '../../types/Renderer';
import { renderFallbackField } from './rendererFallbackField';
import { renderBooleanField } from './fields/core/renderBooleanField';
import { renderColorField } from './fields/core/renderColorField';
import { renderHtmlField } from './fields/core/renderHtmlField';
import { renderImageField } from './fields/core/renderImageField';
import { renderLinkField } from './fields/core/renderLinkField';
import { renderListField } from './fields/core/renderListField';
import { renderMarkdownField } from './fields/core/renderMarkdownField';
import { renderNumberField } from './fields/core/renderNumberField';
import { renderObjectField } from './fields/core/renderObjectField';
import { renderRichTextField } from './fields/core/renderRichTextField';
import { renderSelectField } from './fields/core/renderSelectField';
//import { renderTextAreaField } from './fields/core/renderTextAreaField';

import { renderTextField } from './fields/core/renderTextField';

const fieldRenderers: Record<string, (value: any, options: RenderOptions, field: Field) => string> =
    {
        'core/boolean': renderBooleanField,
        'core/color': renderColorField,
        'core/html': renderHtmlField,
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
