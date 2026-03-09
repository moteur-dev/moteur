import { BlockSchema } from '@moteur/types/Block.js';
import { ValidationResult } from '@moteur/types/ValidationResult.js';
import { createValidationResult, addIssue } from '../utils/validation.js';
import { validateFieldValue } from './validateFieldValue.js';
import fieldRegistry from '../registry/FieldRegistry.js';
import type { Field } from '@moteur/types/Field.js';

export function validateBlock(blockInstance: any, blockSchema: BlockSchema): ValidationResult {
    const result = createValidationResult();

    const fields = blockInstance?.fields || {};
    const schemaFields = blockSchema?.fields || {};

    for (const fieldName of Object.keys(schemaFields)) {
        const fieldDef = schemaFields[fieldName] as Field;
        const fieldValue = fields[fieldName];
        const fieldPath = `fields.${fieldName}`;

        if (fieldValue === undefined || fieldValue === null) {
            addIssue(result, {
                type: 'warning',
                code: 'BLOCK_FIELD_MISSING',
                message: `Missing value for required field "${fieldName}".`,
                path: fieldPath
            });
            continue;
        }

        const fieldType = fieldDef.type;
        if (!fieldRegistry.get(fieldType)) {
            addIssue(result, {
                type: 'error',
                code: 'BLOCK_FIELD_TYPE_UNKNOWN',
                message: `Unknown field type "${fieldType}" used in field "${fieldName}".`,
                path: fieldPath
            });
            continue;
        }

        const issues = validateFieldValue(fieldValue, fieldDef, fieldPath);
        for (const issue of issues) {
            addIssue(result, issue);
        }
    }

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
