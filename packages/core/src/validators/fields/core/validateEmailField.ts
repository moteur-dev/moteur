import { Field } from '@moteur/types/Field.js';
import { ValidationIssue } from '@moteur/types/ValidationResult.js';

/** Standard email format regex (RFC 5322 simplified). */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmailField(value: any, field: Field, path: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (typeof value !== 'string') {
        issues.push({
            type: 'error',
            code: 'EMAIL_INVALID_TYPE',
            message: 'Expected a string value for email.',
            path,
            context: { value }
        });
        return issues;
    }

    const allowEmpty = field.options?.allowEmpty === true;
    if (allowEmpty && (value === '' || value.trim() === '')) {
        return issues;
    }

    if (value.trim() === '') {
        issues.push({
            type: 'error',
            code: 'EMAIL_EMPTY',
            message: 'Email cannot be empty.',
            path,
            context: { value }
        });
        return issues;
    }

    if (!EMAIL_REGEX.test(value.trim())) {
        issues.push({
            type: 'error',
            code: 'EMAIL_INVALID_FORMAT',
            message: 'Value is not a valid email address.',
            path,
            context: { value }
        });
    }

    return issues;
}
