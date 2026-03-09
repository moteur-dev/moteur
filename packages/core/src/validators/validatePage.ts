import type { TemplateSchema } from '@moteur/types/Template.js';
import { ValidationResult } from '@moteur/types/ValidationResult.js';
import { validateFieldsAgainstSchema } from './validateFieldsAgainstSchema.js';
import type { Field } from '@moteur/types/Field.js';

export function validatePage(
    page: { id: string; fields?: Record<string, unknown> },
    schema: TemplateSchema
): ValidationResult {
    const pathPrefix = `pages/${page.id}.fields`;
    const issues = validateFieldsAgainstSchema(
        page.fields,
        schema.fields as Record<string, Field>,
        pathPrefix,
        'PAGE_MISSING_REQUIRED_FIELD'
    );

    const valid = issues.every(issue => issue.type !== 'error');
    return { valid, issues };
}
