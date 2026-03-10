import { Field } from '@moteur/types/Field.js';
import { ValidationIssue } from '@moteur/types/ValidationResult.js';

export function validateRelationField(value: any, field: Field, path: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (value === null || value === undefined) {
        const allowEmpty = field.options?.allowEmpty !== false;
        if (!allowEmpty) {
            issues.push({
                type: 'error',
                code: 'RELATION_EMPTY',
                message: 'A relation reference is required.',
                path,
                context: { value }
            });
        }
        return issues;
    }

    if (typeof value === 'string') {
        if (value.trim() === '') {
            issues.push({
                type: 'error',
                code: 'RELATION_EMPTY',
                message: 'Relation ID cannot be empty.',
                path,
                context: { value }
            });
        }
        return issues;
    }

    if (typeof value === 'object' && !Array.isArray(value)) {
        if (!value.id || typeof value.id !== 'string') {
            issues.push({
                type: 'error',
                code: 'RELATION_MISSING_ID',
                message: 'Relation reference must have a string "id" property.',
                path,
                context: { value }
            });
        }
        return issues;
    }

    issues.push({
        type: 'error',
        code: 'RELATION_INVALID_TYPE',
        message: 'Relation must be a string ID or an object with an "id" property.',
        path,
        context: { value }
    });

    return issues;
}
