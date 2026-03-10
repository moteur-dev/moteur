import { Field } from '@moteur/types/Field.js';
import { ValidationIssue } from '@moteur/types/ValidationResult.js';

export function validateSelectField(value: any, field: Field, path: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (typeof value !== 'string') {
        issues.push({
            type: 'error',
            code: 'SELECT_INVALID_TYPE',
            message: 'Expected a string value for select.',
            path,
            context: { value }
        });
        return issues;
    }

    const allowEmpty = field.options?.allowEmpty === true;
    if (value === '' && allowEmpty) {
        return issues;
    }

    if (value === '') {
        issues.push({
            type: 'error',
            code: 'SELECT_EMPTY',
            message: 'A selection is required.',
            path,
            context: { value }
        });
        return issues;
    }

    const opts = field.options;
    const choices = Array.isArray(opts) ? opts : (opts?.choices ?? opts?.values);
    if (Array.isArray(choices) && choices.length > 0) {
        const allowed = choices.map((c: any) => (typeof c === 'string' ? c : c?.value));
        if (!allowed.includes(value)) {
            issues.push({
                type: 'error',
                code: 'SELECT_INVALID_CHOICE',
                message: `Value "${value}" is not a valid choice.`,
                path,
                context: { value, allowed }
            });
        }
    }

    return issues;
}
