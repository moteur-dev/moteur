import { Field } from '../../../types/Field.js';
import { ValidationIssue } from '../../../types/ValidationResult.js';

export function validateMarkdownField(value: any, field: Field, path: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (typeof value !== 'string') {
        issues.push({
            type: 'error',
            code: 'INVALID_MARKDOWN_TYPE',
            message: 'Expected a markdown string.',
            path,
            context: { value }
        });
    }

    return issues;
}
