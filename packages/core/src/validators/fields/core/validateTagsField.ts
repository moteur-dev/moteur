import { Field } from '@moteur/types/Field';
import { ValidationIssue } from '@moteur/types/ValidationResult';

export function validateTagsField(value: any, field: Field, path: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    const opts = field.options || {};

    // Check if the value is an array (list of tags)
    if (!Array.isArray(value)) {
        issues.push({
            type: 'error',
            code: 'TAGS_INVALID_TYPE',
            message: 'Expected an array of tag IDs.',
            path,
            context: { value }
        });
        return issues; // no further checks if not an array
    }

    // Check maxTags constraint
    if (opts.maxTags !== undefined && value.length > opts.maxTags) {
        issues.push({
            type: 'error',
            code: 'TAGS_TOO_MANY',
            message: `Too many tags (max ${opts.maxTags}).`,
            path,
            context: { value, max: opts.maxTags }
        });
    }

    // Check if each tag is a string
    value.forEach((tag, index) => {
        if (typeof tag !== 'string') {
            issues.push({
                type: 'error',
                code: 'TAG_INVALID_TYPE',
                message: 'Each tag must be a string.',
                path: `${path}[${index}]`,
                context: { tag }
            });
        }
    });

    // Check that a tag source is defined
    if (!opts.source || typeof opts.source !== 'string') {
        issues.push({
            type: 'error',
            code: 'TAGS_MISSING_SOURCE',
            message: 'Tag field must have a valid "source" defined in options.',
            path: path,
            context: { options: opts }
        });
    }

    return issues;
}
