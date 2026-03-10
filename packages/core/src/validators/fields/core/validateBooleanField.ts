import { Field } from '@moteur/types/Field.js';
import { ValidationIssue } from '@moteur/types/ValidationResult.js';

export function validateBooleanField(value: any, field: Field, path: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (typeof value !== 'boolean') {
        issues.push({
            type: 'error',
            code: 'BOOLEAN_INVALID_TYPE',
            message: 'Expected a boolean value.',
            path,
            context: { value }
        });
    }

    return issues;
}
