import { Field } from '@moteur/types/Field';
import { ValidationIssue } from '@moteur/types/ValidationResult';

export function validateNumberField(value: any, field: Field, path: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (typeof value !== 'number') {
        issues.push({
            type: 'error',
            code: 'INVALID_NUMBER_TYPE',
            message: 'Expected a number value.',
            path,
            context: { value }
        });
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
