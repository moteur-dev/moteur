import { Field } from '@moteur/types/Field.js';
import { ValidationIssue } from '@moteur/types/ValidationResult.js';

export function validateLinkField(value: any, field: Field, path: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (typeof value === 'string') {
        if (value.trim() === '') {
            issues.push({
                type: 'error',
                code: 'LINK_EMPTY',
                message: 'Link URL cannot be empty.',
                path,
                context: { value }
            });
        }
        return issues;
    }

    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        issues.push({
            type: 'error',
            code: 'LINK_INVALID_TYPE',
            message: 'Link must be a string URL or an object with a "url" property.',
            path,
            context: { value }
        });
        return issues;
    }

    if (!value.url || typeof value.url !== 'string') {
        issues.push({
            type: 'error',
            code: 'LINK_MISSING_URL',
            message: 'Link must have a non-empty "url" string.',
            path: `${path}.url`,
            context: { url: value.url }
        });
    }

    if (value.label !== undefined && typeof value.label !== 'string') {
        issues.push({
            type: 'warning',
            code: 'LINK_INVALID_LABEL',
            message: 'Link "label" should be a string.',
            path: `${path}.label`,
            context: { label: value.label }
        });
    }

    return issues;
}
