import { ValidationIssue } from '@moteur/types/ValidationResult.js';
import { Field } from '@moteur/types/Field.js';

export function validateDateTimeField(value: any, field: Field, path: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    if (typeof value !== 'string') {
        issues.push({
            type: 'error',
            code: 'DATETIME_INVALID_TYPE',
            message: 'Date-time value must be a string in ISO 8601 format.',
            path,
            context: { value }
        });
        return issues;
    }

    const parsedDate = Date.parse(value);
    if (isNaN(parsedDate)) {
        issues.push({
            type: 'error',
            code: 'DATETIME_INVALID_FORMAT',
            message: 'Date-time value is not a valid ISO 8601 date.',
            path,
            context: { value }
        });
        return issues;
    }

    const date = new Date(parsedDate);

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
