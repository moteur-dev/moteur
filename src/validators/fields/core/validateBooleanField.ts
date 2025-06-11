import { Field } from '../../../types/Field';
import { ValidationIssue } from '../../../types/ValidationResult';
import { FieldRegistry } from '../../../registry/FieldRegistry';

const fieldRegistry = new FieldRegistry();

export function validateBooleanField(value: any, field: Field, path: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    const fieldSchema = fieldRegistry.get(field.type);

    const actualValue = fieldSchema.storeDirect ? value : value?.value;

    if (typeof actualValue !== 'boolean') {
        issues.push({
            type: 'error',
            code: 'INVALID_BOOLEAN_TYPE',
            message: 'Expected a boolean value.',
            path,
            context: { actualValue }
        });
    }

    return issues;
}
