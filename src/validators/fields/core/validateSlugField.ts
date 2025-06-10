import { Field } from '../../../types/Field.js';
import { ValidationIssue } from '../../../types/ValidationResult.js';
import { FieldRegistry } from '../../../registry/FieldRegistry.js';

const fieldRegistry = new FieldRegistry();

export function validateSlugField(value: any, field: Field, path: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const fieldSchema = fieldRegistry.get(field.type);

    const actualValue = fieldSchema.storeDirect ? value : value?.value;
    const isMultilingual = fieldSchema?.options?.multilingual === true;

    if (actualValue === undefined || actualValue === null || actualValue === '') {
        // Slug is optional if empty
        return issues;
    }

    if (isMultilingual) {
        if (typeof actualValue !== 'object' || Array.isArray(actualValue)) {
            issues.push({
                type: 'error',
                code: 'INVALID_SLUG_MULTILINGUAL_FORMAT',
                message: 'Expected an object with locale keys for a multilingual slug.',
                path,
                context: { actualValue }
            });
            return issues;
        }

        for (const [locale, slug] of Object.entries(actualValue)) {
            if (typeof slug !== 'string' || slug.trim() === '') {
                issues.push({
                    type: 'error',
                    code: 'INVALID_SLUG_VALUE',
                    message: `Slug for locale "${locale}" must be a non-empty string.`,
                    path: `${path}.${locale}`,
                    context: { slug }
                });
            } else if (!/^[a-zA-Z0-9_-]+$/.test(slug)) {
                issues.push({
                    type: 'error',
                    code: 'INVALID_SLUG_FORMAT',
                    message: `Slug for locale "${locale}" contains invalid characters.`,
                    path: `${path}.${locale}`,
                    context: { slug }
                });
            }
        }
    } else {
        if (typeof actualValue !== 'string' || actualValue.trim() === '') {
            issues.push({
                type: 'error',
                code: 'INVALID_SLUG_VALUE',
                message: 'Slug must be a non-empty string.',
                path,
                context: { actualValue }
            });
        } else if (!/^[a-zA-Z0-9_-]+$/.test(actualValue)) {
            issues.push({
                type: 'error',
                code: 'INVALID_SLUG_FORMAT',
                message:
                    'Slug contains invalid characters. Only letters, numbers, "-" and "_" are allowed.',
                path,
                context: { actualValue }
            });
        }
    }

    return issues;
}
