import { Field } from '../../../types/Field';
import { ValidationIssue } from '../../../types/ValidationResult';
import { validateFieldValue } from '../../validateFieldValue';

export function validateListField(value: any, field: Field, path: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (!Array.isArray(value)) {
        issues.push({
            type: 'error',
            code: 'INVALID_LIST_TYPE',
            message: 'Expected a list (array) of values.',
            path,
            context: { value }
        });
        return issues;
    }

    const itemField = field.options?.items as Field;
    if (!itemField) {
        issues.push({
            type: 'warning',
            code: 'INVALID_LIST_MISSING_ITEMS',
            message: 'No "items" field definition found for list.',
            path,
            context: { value }
        });
        return issues;
    }

    value.forEach((item, index) => {
        const itemPath = `${path}[${index}]`;
        const itemIssues = validateFieldValue(item, itemField, itemPath);
        issues.push(...itemIssues);
    });

    return issues;
}
