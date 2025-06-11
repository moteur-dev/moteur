import { Field } from '../../../types/Field';
import { ValidationIssue } from '../../../types/ValidationResult';
import { validateFieldValue } from '../../validateFieldValue';

export function validateObjectField(value: any, field: Field, path: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (typeof value !== 'object' || value === null) {
        issues.push({
            type: 'error',
            code: 'INVALID_OBJECT_TYPE',
            message: 'Expected an object.',
            path,
            context: { value }
        });
        return issues;
    }

    const fields = field.data || {};
    for (const [key, subField] of Object.entries(fields)) {
        const subValue = value[key];
        const subPath = `${path}.${key}`;
        issues.push(...validateFieldValue(subValue, subField, subPath));
    }

    return issues;
}
