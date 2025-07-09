import { ValidationIssue } from '@moteur/types/ValidationResult';
import { Field } from '@moteur/types/Field';
// @ts-expect-error - Sanitize HTML does not have a default export
import sanitizeHtml from 'sanitize-html';

export function validateHtmlField(value: any, field: Field, path: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (typeof value !== 'string') {
        issues.push({
            type: 'error',
            code: 'INVALID_HTML_TYPE',
            message: 'Value must be a string (HTML).',
            path,
            context: { value }
        });
        return issues;
    }

    // Sanitize using field's config
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

    // Optionally: validate configured allowedTags themselves
    const validTags = ['p', 'strong', 'em', 'ul', 'li', 'a', 'br', 'span', 'div'];
    const invalidTags = (allowedTags as string[]).filter(tag => !validTags.includes(tag));
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
