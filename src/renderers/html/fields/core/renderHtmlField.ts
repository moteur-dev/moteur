import { Field } from '../../../../types/Field';
import { RenderOptions } from '../../../../types/Renderer';
// @ts-expect-error - sanitize-html has no default export
import sanitizeHtml from 'sanitize-html';

export function renderHtmlField(value: any, options: RenderOptions, field: Field): string {
    const rawHtml = value?.html?.[options.locale];
    if (!rawHtml) return '';

    const allowedTags = field.options?.allowedTags ?? [
        'p',
        'strong',
        'em',
        'ul',
        'ol',
        'li',
        'a',
        'br',
        'span',
        'div'
    ];

    const sanitizedHtml = sanitizeHtml(rawHtml, {
        allowedTags,
        allowedAttributes: {
            a: ['href', 'name', 'target', 'rel'],
            '*': ['class', 'style']
        }
    });

    return sanitizedHtml;
}
