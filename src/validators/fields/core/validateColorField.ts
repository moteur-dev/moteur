import { ValidationIssue } from '../../../types/ValidationResult';
import { FieldRegistry } from '../../../registry/FieldRegistry';
import { Field } from '../../../types/Field';

const fieldRegistry = new FieldRegistry();

export function validateColorField(value: any, field: Field, path: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    const fieldSchema = fieldRegistry.get(field.type);

    const colorValue = fieldSchema.storeDirect ? value : value?.color;

    if (typeof colorValue !== 'string') {
        issues.push({
            type: 'error',
            code: 'INVALID_COLOR_STING',
            message: 'Color must be a string (e.g., "#ff0000").',
            path,
            context: { value }
        });
        return issues;
    }

    // Validate hex color
    const allowAlpha = field.options?.allowAlpha ?? false;
    const hexRegex = allowAlpha
        ? /^#(?:[0-9a-fA-F]{4}|[0-9a-fA-F]{8}|[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/
        : /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

    if (!hexRegex.test(colorValue)) {
        issues.push({
            type: 'error',
            code: 'INVALID_COLOR_FORMAT',
            message: `Invalid color format. Expected ${allowAlpha ? '3/4/6/8-digit hex' : '3/6-digit hex'}.`,
            path,
            context: { value }
        });
    }

    // Validate against preset colors if allowCustom=false
    if (field.options?.presetColors && !field.options.allowCustom) {
        const allowed = field.options.presetColors;
        if (!allowed.includes(colorValue)) {
            issues.push({
                type: 'error',
                code: 'INVALID_COLOR_PRESET',
                message: `Color must be one of the preset colors.`,
                path,
                context: { allowed, value: colorValue }
            });
        }
    }

    return issues;
}
