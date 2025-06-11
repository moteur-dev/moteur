import { Entry } from '../types/Model';
import { ModelSchema } from '../types/Model';
import { validateFieldValue } from './validateFieldValue';
import { ValidationResult, ValidationIssue } from '../types/ValidationResult';

export function validateEntry(entry: Entry, schema: ModelSchema): ValidationResult {
    const issues: ValidationIssue[] = [];

    // Validate each field in the schema
    for (const [fieldKey, fieldSchema] of Object.entries(schema.fields)) {
        const value = entry.data[fieldKey];

        const path = `models/${schema.id}/entries/${entry.id}.data.${fieldKey}`;
        // Check if required and missing
        if (
            fieldSchema.options?.required &&
            (value === undefined || value === null || value === '')
        ) {
            issues.push({
                type: 'error',
                code: 'ENTRY_MISSING_REQUIRED_FIELD',
                message: `Required field "${fieldKey}" is missing.`,
                path: path,
                hint: 'Provide a value for this field.'
            });
            continue; // Skip further checks for this field
        }

        // Validate field-specific rules (type, min/max, etc.)
        if (value !== undefined) {
            const fieldValidation = validateFieldValue(value, fieldSchema, path);
            issues.push(...fieldValidation);
        }
    }

    const valid = issues.every(issue => issue.type !== 'error');

    return {
        valid,
        issues
    };
}
