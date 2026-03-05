import { Page } from '@moteur/types/Page.js';
import { TemplateSchema } from '@moteur/types/Template.js';
import { validateFieldValue } from './validateFieldValue.js';
import { ValidationResult, ValidationIssue } from '@moteur/types/ValidationResult.js';
import type { Field } from '@moteur/types/Field.js';

export function validatePage(page: Page, schema: TemplateSchema): ValidationResult {
    const issues: ValidationIssue[] = [];

    for (const [fieldKey, fieldSchema] of Object.entries(schema.fields)) {
        const value = page.fields?.[fieldKey];

        const path = `pages/${page.id}.fields.${fieldKey}`;
        if (
            (fieldSchema as Field).options?.required &&
            (value === undefined || value === null || value === '')
        ) {
            issues.push({
                type: 'error',
                code: 'PAGE_MISSING_REQUIRED_FIELD',
                message: `Required field "${fieldKey}" is missing.`,
                path,
                hint: 'Provide a value for this field.'
            });
            continue;
        }

        if (value !== undefined) {
            const fieldValidation = validateFieldValue(value, fieldSchema as Field, path);
            issues.push(...fieldValidation);
        }
    }

    const valid = issues.every(issue => issue.type !== 'error');
    return { valid, issues };
}
