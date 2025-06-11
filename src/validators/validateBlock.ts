import { Block, BlockSchema } from '../types/Block';
import { Field } from '../types/Field';
import { ValidationResult } from '../types/ValidationResult';
import { createValidationResult, addIssue } from '../utils/validation';

type FieldRegistry = Record<string, Field>;

export function validateBlock(
    blockInstance: any,
    blockSchema: BlockSchema,
    fieldRegistry: FieldRegistry
): ValidationResult {
    const result = createValidationResult();

    const fields = blockInstance?.fields || {};
    const schemaFields = blockSchema?.fields || {};

    for (const fieldName of Object.keys(schemaFields)) {
        const fieldDef = schemaFields[fieldName];
        const fieldValue = fields[fieldName];

        if (fieldValue === undefined || fieldValue === null) {
            addIssue(result, {
                type: 'warning',
                code: 'BLOCK_FIELD_MISSING',
                message: `Missing value for required field "${fieldName}".`,
                path: `fields.${fieldName}`
            });
            continue;
        }

        // Check if field type is registered
        const fieldType = fieldDef.type;
        const fieldTypeDef = fieldRegistry[fieldType];
        if (!fieldTypeDef) {
            addIssue(result, {
                type: 'error',
                code: 'BLOCK_FIELD_TYPE_UNKNOWN',
                message: `Unknown field type "${fieldType}" used in field "${fieldName}".`,
                path: `fields.${fieldName}`
            });
            continue;
        }

        if (!isValidFieldValue(fieldType, fieldValue)) {
            addIssue(result, {
                type: 'warning',
                code: 'BLOCK_FIELD_VALUE_INVALID',
                message: `Field "${fieldName}" has an invalid value for type "${fieldType}".`,
                path: `fields.${fieldName}`,
                context: { value: fieldValue }
            });
        }
    }

    // Optional: Check for unexpected fields
    for (const key of Object.keys(fields)) {
        if (!schemaFields[key]) {
            addIssue(result, {
                type: 'warning',
                code: 'BLOCK_FIELD_UNEXPECTED',
                message: `Unexpected field "${key}" not defined in block schema.`,
                path: `fields.${key}`
            });
        }
    }

    return result;
}

function isValidFieldValue(type: string, value: any): boolean {
    switch (type) {
        case 'core/text':
        case 'core/rich-text':
        case 'core/link':
            return typeof value === 'string' || typeof value === 'object';
        case 'core/image':
            return typeof value === 'object' && value !== null;
        case 'core/list':
            return Array.isArray(value);
        case 'core/structure':
            return typeof value === 'object' && value !== null;
        default:
            return true; // fallback to valid for unknowns
    }
}
