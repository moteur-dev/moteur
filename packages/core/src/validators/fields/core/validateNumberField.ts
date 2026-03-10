import { Field } from '@moteur/types/Field.js';
import { ValidationIssue } from '@moteur/types/ValidationResult.js';

export function validateNumberField(value: any, field: Field, path: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (typeof value !== 'number' || Number.isNaN(value)) {
        issues.push({
            type: 'error',
            code: 'NUMBER_INVALID_TYPE',
            message: 'Expected a number value.',
            path,
            context: { value }
        });
        return issues;
    }

    const opts = field.options || {};

    if (opts.min !== undefined && value < opts.min) {
        issues.push({
            type: 'error',
            code: 'NUMBER_BELOW_MIN',
            message: `Value is too small (min ${opts.min}).`,
            path,
            context: { value }
        });
    }
    if (opts.max !== undefined && value > opts.max) {
        issues.push({
            type: 'error',
            code: 'NUMBER_ABOVE_MAX',
            message: `Value is too large (max ${opts.max}).`,
            path,
            context: { value }
        });
    }

    return issues;
}
