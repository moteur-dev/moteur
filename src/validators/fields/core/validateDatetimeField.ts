import { ValidationIssue } from '../../../types/ValidationResult';
import { Field } from '../../../types/Field';
import { FieldRegistry } from '../../../registry/FieldRegistry';

const fieldRegistry = new FieldRegistry();

export function validateDateTimeField(value: any, field: Field, path: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Determine the actual value to validate
    const fieldSchema = fieldRegistry.get(field.type);

    const actualValue = fieldSchema.storeDirect ? value : value?.value;

    // Basic presence check
    if (typeof actualValue !== 'string') {
        issues.push({
            type: 'error',
            code: 'INVALID_DATETIME_TYPE',
            message: 'Date-time value must be a string in ISO 8601 format.',
            path,
            context: { value }
        });
        return issues;
    }

    // Check if it's a valid ISO8601 date
    const parsedDate = Date.parse(actualValue);
    if (isNaN(parsedDate)) {
        issues.push({
            type: 'error',
            code: 'INVALID_DATETIME_FORMAT',
            message: 'Date-time value is not a valid ISO 8601 date.',
            path,
            context: { value }
        });
        return issues;
    }

    const date = new Date(parsedDate);

    // Validate against options
    if (field.options?.allowPastDates === false && date < new Date()) {
        issues.push({
            type: 'error',
            code: 'DATETIME_PAST_NOT_ALLOWED',
            message: 'Past dates are not allowed.',
            path,
            context: { value }
        });
    }

    if (field.options?.allowFutureDates === false && date > new Date()) {
        issues.push({
            type: 'error',
            code: 'DATETIME_FUTURE_NOT_ALLOWED',
            message: 'Future dates are not allowed.',
            path,
            context: { value }
        });
    }

    if (field.options?.minDate && Date.parse(field.options.minDate) > parsedDate) {
        issues.push({
            type: 'error',
            code: 'DATETIME_BEFORE_MIN_DATE',
            message: `Date is earlier than minimum allowed date: ${field.options.minDate}.`,
            path,
            context: { value, minDate: field.options.minDate }
        });
    }

    if (field.options?.maxDate && Date.parse(field.options.maxDate) < parsedDate) {
        issues.push({
            type: 'error',
            code: 'DATETIME_AFTER_MAX_DATE',
            message: `Date is later than maximum allowed date: ${field.options.maxDate}.`,
            path,
            context: { value, maxDate: field.options.maxDate }
        });
    }

    return issues;
}
