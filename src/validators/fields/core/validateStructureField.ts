import { Field } from '../../../types/Field';
import { ValidationIssue } from '../../../types/ValidationResult';
import { getStructure } from '../../../api/structures';
import { validateFieldValue } from '../../validateFieldValue';

export function validateStructureField(value: any, field: Field, path: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // --- Access runtime configuration of this field
    const structureId = field.options?.structure;
    const inlineSchema = field.options?.inlineSchema;

    // --- Check for conflicting config
    if (structureId && inlineSchema) {
        issues.push({
            type: 'error',
            code: 'INVALID_STRUCTURE_CONFIGURATION',
            message: 'Cannot define both "structure" and "inlineSchema". Choose one.',
            path
        });
        return issues;
    }

    // --- Load the schema (either shared or inline)
    let schemaFields: Record<string, any> | undefined;
    if (structureId) {
        try {
            const sharedSchema = getStructure(structureId);
            schemaFields = sharedSchema.fields;
        } catch (error) {
            issues.push({
                type: 'error',
                code: 'STRUCTURE_SCHEMA_NOT_FOUND',
                message: `Shared structure schema "${structureId}" not found.`,
                path
            });
            return issues;
        }
    } else if (inlineSchema) {
        schemaFields = inlineSchema.fields;
    } else {
        issues.push({
            type: 'error',
            code: 'MISSING_STRUCTURE_OR_SCHEMA',
            message: 'Either "structure" or "inlineSchema" must be defined in field.options.',
            path
        });
        return issues;
    }

    // --- Validate the content of the structure
    const contentValue = value?.content;
    if (!contentValue || typeof contentValue !== 'object') {
        issues.push({
            type: 'error',
            code: 'INVALID_STRUCTURE_CONTENT',
            message: 'The "content" field must be an object.',
            path
        });
        return issues;
    }

    if (!schemaFields) {
        // Defensive fallback if somehow it's still missing
        issues.push({
            type: 'error',
            code: 'MISSING_STRUCTURE_FIELDS',
            message: 'Structure schema fields are missing.',
            path
        });
        return issues;
    }

    for (const [subKey, subField] of Object.entries(schemaFields)) {
        const subValue = contentValue[subKey];
        const subIssues = validateFieldValue(subValue, subField, `${path}.content.${subKey}`);
        issues.push(...subIssues);
    }

    return issues;
}
