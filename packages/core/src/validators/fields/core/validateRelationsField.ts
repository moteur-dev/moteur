import { Field } from '@moteur/types/Field.js';
import { ValidationIssue } from '@moteur/types/ValidationResult.js';
import { validateRelationField } from './validateRelationField.js';

export function validateRelationsField(value: any, field: Field, path: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (!Array.isArray(value)) {
        issues.push({
            type: 'error',
            code: 'RELATIONS_INVALID_TYPE',
            message: 'Expected an array of relation references.',
            path,
            context: { value }
        });
        return issues;
    }

    const allowEmpty = field.options?.allowEmpty !== false;
    if (!allowEmpty && value.length === 0) {
        issues.push({
            type: 'error',
            code: 'RELATIONS_EMPTY',
            message: 'At least one relation is required.',
            path,
            context: { value }
        });
    }

    if (field.options?.minItems !== undefined && value.length < field.options.minItems) {
        issues.push({
            type: 'error',
            code: 'RELATIONS_TOO_FEW',
            message: `Must have at least ${field.options.minItems} relations.`,
            path,
            context: { count: value.length, min: field.options.minItems }
        });
    }

    if (field.options?.maxItems !== undefined && value.length > field.options.maxItems) {
        issues.push({
            type: 'error',
            code: 'RELATIONS_TOO_MANY',
            message: `Must have at most ${field.options.maxItems} relations.`,
            path,
            context: { count: value.length, max: field.options.maxItems }
        });
    }

    const singleField: Field = { ...field, type: 'core/relation', label: field.label };
    value.forEach((item, index) => {
        const itemIssues = validateRelationField(item, singleField, `${path}[${index}]`);
        issues.push(...itemIssues);
    });

    return issues;
}
