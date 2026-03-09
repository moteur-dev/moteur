import { Entry } from '@moteur/types/Model.js';
import { ModelSchema } from '@moteur/types/Model.js';
import { ValidationResult } from '@moteur/types/ValidationResult.js';
import { validateFieldsAgainstSchema } from './validateFieldsAgainstSchema.js';

export function validateEntry(entry: Entry, schema: ModelSchema): ValidationResult {
    const pathPrefix = `models/${schema.id}/entries/${entry.id}.data`;
    const issues = validateFieldsAgainstSchema(
        entry.data,
        schema.fields,
        pathPrefix,
        'ENTRY_MISSING_REQUIRED_FIELD'
    );

    const valid = issues.every(issue => issue.type !== 'error');
    return { valid, issues };
}
