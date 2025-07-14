import { Field } from '@moteur/types/Field';
import { ValidationIssue } from '@moteur/types/ValidationResult';
import fieldRegistry from '../../../registry/FieldRegistry.js';

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
