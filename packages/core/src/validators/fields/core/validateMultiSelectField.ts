import { Field } from '@moteur/types/Field.js';
import { ValidationIssue } from '@moteur/types/ValidationResult.js';

export function validateMultiSelectField(
    value: any,
    field: Field,
    path: string
): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const allowEmpty = field.options?.allowEmpty === true;

    if (!Array.isArray(value)) {
        issues.push({
            type: 'error',
            code: 'MULTI_SELECT_INVALID_TYPE',
            message: 'Expected an array of strings.',
            path,
            context: { value }
        });
        return issues;
    }

    if (!allowEmpty && value.length === 0) {
        issues.push({
            type: 'error',
            code: 'MULTI_SELECT_EMPTY',
            message: 'At least one selection is required.',
            path,
            context: { value }
        });
    }

    value.forEach((item, index) => {
        if (typeof item !== 'string') {
            issues.push({
                type: 'error',
                code: 'MULTI_SELECT_ITEM_INVALID_TYPE',
                message: 'Each selection must be a string.',
                path: `${path}[${index}]`,
                context: { item }
            });
        }
    });

    return issues;
}
