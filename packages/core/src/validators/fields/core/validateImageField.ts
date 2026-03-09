import { Field } from '@moteur/types/Field.js';
import { ValidationIssue } from '@moteur/types/ValidationResult.js';

export function validateImageField(value: any, field: Field, path: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        issues.push({
            type: 'error',
            code: 'IMAGE_INVALID_TYPE',
            message: 'Expected an object with image properties (src, alt, etc.).',
            path,
            context: { value }
        });
        return issues;
    }

    if (!value.src || typeof value.src !== 'string') {
        issues.push({
            type: 'error',
            code: 'IMAGE_MISSING_SRC',
            message: 'Image must have a non-empty "src" string.',
            path: `${path}.src`,
            context: { src: value.src }
        });
    }

    if (value.alt !== undefined && typeof value.alt !== 'string') {
        issues.push({
            type: 'warning',
            code: 'IMAGE_INVALID_ALT',
            message: 'Image "alt" should be a string.',
            path: `${path}.alt`,
            context: { alt: value.alt }
        });
    }

    return issues;
}
