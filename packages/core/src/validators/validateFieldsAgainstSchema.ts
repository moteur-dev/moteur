import { validateFieldValue } from './validateFieldValue.js';
import { ValidationIssue } from '@moteur/types/ValidationResult.js';
import type { Field } from '@moteur/types/Field.js';

/**
 * Validates a set of field values against their schema definitions.
 * Shared logic used by both validateEntry and validatePage.
 */
export function validateFieldsAgainstSchema(
    data: Record<string, unknown> | undefined,
    schemaFields: Record<string, Field>,
    pathPrefix: string,
    missingFieldCode: string
): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    for (const [fieldKey, fieldSchema] of Object.entries(schemaFields)) {
        const value = data?.[fieldKey];
        const path = `${pathPrefix}.${fieldKey}`;

        if (
            fieldSchema.options?.required &&
            (value === undefined || value === null || value === '')
        ) {
            issues.push({
                type: 'error',
                code: missingFieldCode,
                message: `Required field "${fieldKey}" is missing.`,
                path,
                hint: 'Provide a value for this field.'
            });
            continue;
        }

        if (value !== undefined) {
            const fieldValidation = validateFieldValue(value, fieldSchema, path);
            issues.push(...fieldValidation);
        }
    }

    return issues;
}
