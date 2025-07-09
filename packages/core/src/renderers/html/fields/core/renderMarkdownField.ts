import { Field } from '@moteur/types/Field';
import { RenderOptions } from '@moteur/types/Renderer';
import { renderAttributesFromMeta } from '../../../../utils/renderAttributesFromMeta';
import { marked } from 'marked';
// @ts-expect-error - sanitize-html has no default export
import sanitizeHtml from 'sanitize-html';

export function renderMarkdownField(value: any, options: RenderOptions, field: Field): string {
    const raw = value?.markdown?.[options.locale] || '';
    if (!raw) return '';

    //const allowHTML = field.options?.allowHTML === true;
    const attrs = renderAttributesFromMeta(field.meta);

    let html = marked.parse(raw);
    html = sanitizeHtml(html);

    return `<div class="markdown-field"${attrs}>${html}</div>`;
}
