import { Field } from '@moteur/types/Field.js';
import { ValidationIssue } from '@moteur/types/ValidationResult.js';

export function validateJsonField(value: any, field: Field, path: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const allowEmpty = field.options?.allowEmpty === true;

    if (value === undefined || value === null) {
        if (!allowEmpty) {
            issues.push({
                type: 'error',
                code: 'JSON_EMPTY',
                message: 'JSON field cannot be empty.',
                path,
                context: { value }
            });
        }
        return issues;
    }

    if (typeof value === 'string') {
        if (allowEmpty && value.trim() === '') return issues;
        try {
            JSON.parse(value);
        } catch {
            issues.push({
                type: 'error',
                code: 'JSON_INVALID',
                message: 'Value is not valid JSON.',
                path,
                context: { value }
            });
        }
        return issues;
    }

    if (typeof value === 'object') {
        return issues;
    }

    issues.push({
        type: 'error',
        code: 'JSON_INVALID_TYPE',
        message: 'JSON field must be a string or object.',
        path,
        context: { value }
    });
    return issues;
}
