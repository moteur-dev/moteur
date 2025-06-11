import { Field } from '../../../types/Field';
import { ValidationIssue } from '../../../types/ValidationResult';
import { validateFieldValue } from '../../validateFieldValue';

/**
 * Validates a core/table field.
 */
export function validateTableField(value: any, field: Field, path: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const options = field.options || {};

    // Validate rows structure
    if (!Array.isArray(value)) {
        issues.push({
            type: 'error',
            code: 'INVALID_TABLE_FORMAT',
            message: 'Table rows must be an array of rows.',
            path,
            context: { actualValue: value }
        });
        return issues;
    }

    // Row count checks
    if (options.minRows && value.length < options.minRows) {
        issues.push({
            type: 'error',
            code: 'TABLE_TOO_FEW_ROWS',
            message: `Table must have at least ${options.minRows} rows.`,
            path
        });
    }
    if (options.maxRows && value.length > options.maxRows) {
        issues.push({
            type: 'error',
            code: 'TABLE_TOO_MANY_ROWS',
            message: `Table must have at most ${options.maxRows} rows.`,
            path
        });
    }

    const cellSchema: Field | undefined = options.validateCellSchema;
    const allowEmpty = options.allowEmptyCells !== false; // default true

    value.forEach((row: any[], rowIndex: number) => {
        const rowPath = `${path}[${rowIndex}]`;
        if (!Array.isArray(row)) {
            issues.push({
                type: 'error',
                code: 'INVALID_TABLE_ROW',
                message: `Row ${rowIndex} must be an array.`,
                path: rowPath
            });
            return;
        }

        // Column count checks
        if (options.minCols && row.length < options.minCols) {
            issues.push({
                type: 'error',
                code: 'TABLE_TOO_FEW_COLUMNS',
                message: `Row ${rowIndex} must have at least ${options.minCols} columns.`,
                path: rowPath
            });
        }
        if (options.maxCols && row.length > options.maxCols) {
            issues.push({
                type: 'error',
                code: 'TABLE_TOO_MANY_COLUMNS',
                message: `Row ${rowIndex} must have at most ${options.maxCols} columns.`,
                path: rowPath
            });
        }

        // Validate each cell using validateField if schema is provided
        row.forEach((cell, colIndex) => {
            const cellPath = `${rowPath}[${colIndex}]`;

            if ((cell === '' || cell === null) && allowEmpty) {
                return; // skip empty cells if allowed
            }

            if (cellSchema) {
                const cellIssues = validateFieldValue(cell, cellSchema, cellPath);
                issues.push(...cellIssues);
            }
        });
    });

    return issues;
}
