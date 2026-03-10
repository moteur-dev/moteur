import { ValidationIssue } from '@moteur/types/ValidationResult.js';
import { Field } from '@moteur/types/Field.js';
// @ts-expect-error - Sanitize HTML does not have a default export
import sanitizeHtml from 'sanitize-html';

const KNOWN_HTML_TAGS = new Set([
    'p',
    'strong',
    'em',
    'ul',
    'ol',
    'li',
    'a',
    'br',
    'span',
    'div',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'blockquote',
    'pre',
    'code',
    'hr',
    'sub',
    'sup',
    'mark',
    'small',
    'table',
    'thead',
    'tbody',
    'tfoot',
    'tr',
    'th',
    'td',
    'caption',
    'img',
    'figure',
    'figcaption',
    'picture',
    'source',
    'video',
    'audio',
    'details',
    'summary',
    'abbr',
    'cite',
    'del',
    'ins',
    'time',
    'dl',
    'dt',
    'dd',
    'section',
    'article',
    'aside',
    'nav',
    'header',
    'footer',
    'iframe',
    'embed',
    'object',
    'param'
]);

export function validateHtmlField(value: any, field: Field, path: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (typeof value !== 'string') {
        issues.push({
            type: 'error',
            code: 'HTML_INVALID_TYPE',
            message: 'Value must be a string (HTML).',
            path,
            context: { value }
        });
        return issues;
    }

    const allowedTags = field.options?.allowedTags ?? ['p', 'strong', 'em', 'ul', 'li', 'a'];
    const allowedAttributes = field.options?.allowedAttributes ?? { a: ['href', 'target'] };

    const sanitized = sanitizeHtml(value, { allowedTags, allowedAttributes });

    if (sanitized !== value) {
        issues.push({
            type: 'warning',
            code: 'HTML_SANITIZED',
            message: 'HTML was sanitized (some tags or attributes were removed).',
            path,
            context: { original: value, sanitized }
        });
    }

    const invalidTags = (allowedTags as string[]).filter(tag => !KNOWN_HTML_TAGS.has(tag));
    if (invalidTags.length > 0) {
        issues.push({
            type: 'warning',
            code: 'HTML_UNKNOWN_TAGS',
            message: `Field allows unknown HTML tags: ${invalidTags.join(', ')}`,
            path: `${path} (field.options.allowedTags)`,
            context: { invalidTags }
        });
    }

    return issues;
}
