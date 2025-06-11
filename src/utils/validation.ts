import { ValidationIssue, ValidationResult } from '../types/ValidationResult';

export function createValidationResult(): ValidationResult {
    return {
        valid: true,
        issues: []
    };
}

export function addIssue(result: ValidationResult, issue: ValidationIssue): void {
    result.issues.push(issue);
    if (issue.type === 'error') {
        result.valid = false;
    }
}
