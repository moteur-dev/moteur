import { Field } from '@moteur/types/Field';
import { ValidationIssue } from '@moteur/types/ValidationResult';

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
