import { Field } from '@moteur/types/Field';
import { ValidationIssue } from '@moteur/types/ValidationResult';

export function validateTextField(value: any, field: Field, path: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (typeof value !== 'string') {
        issues.push({
            type: 'error',
            code: 'TEXT_INVALID_TYPE',
            message: 'Expected a string value.',
            path,
            context: { value }
        });
    }

    const opts = field.options || {};
    if (typeof value === 'string') {
        if (opts.minLength && value.length < opts.minLength) {
            issues.push({
                type: 'error',
                code: 'TEXT_TOO_SHORT',
                message: `Value is too short (min ${opts.minLength} chars).`,
                path,
                context: { value }
            });
        }
        if (opts.maxLength && value.length > opts.maxLength) {
            issues.push({
                type: 'error',
                code: 'TEXT_TOO_LONG',
                message: `Value is too long (max ${opts.maxLength} chars).`,
                path,
                context: { value }
            });
        }
        if (opts.pattern && !new RegExp(opts.pattern).test(value)) {
            issues.push({
                type: 'error',
                code: 'TEXT_PATTERN_MISMATCH',
                message: `Value does not match pattern: ${opts.pattern}`,
                path,
                context: { value }
            });
        }
    }

    return issues;
}
