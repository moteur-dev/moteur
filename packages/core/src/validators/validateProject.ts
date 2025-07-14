import { ProjectSchema } from '@moteur/types/Project';
import { ValidationResult } from '@moteur/types/ValidationResult';
import { createValidationResult, addIssue } from '../utils/validation.js';

export function validateProject(project: ProjectSchema): ValidationResult {
    const result = createValidationResult();

    // id: required, string
    if (!project.id || typeof project.id !== 'string') {
        addIssue(result, {
            type: 'error',
            code: 'PROJECT_INVALID_ID',
            message: 'Project "id" must be a non-empty string.',
            path: 'id'
        });
    }

    // label: required, string
    if (!project.label || typeof project.label !== 'string') {
        addIssue(result, {
            type: 'error',
            code: 'PROJECT_INVALID_LABEL',
            message: 'Project "label" must be a non-empty string.',
            path: 'label'
        });
    }

    // description: optional, string
    if (project.description !== undefined && typeof project.description !== 'string') {
        addIssue(result, {
            type: 'error',
            code: 'PROJECT_INVALID_DESCRIPTION',
            message: 'Project "description" must be a string if provided.',
            path: 'description'
        });
    }

    // defaultLocale: required, string
    if (!project.defaultLocale || typeof project.defaultLocale !== 'string') {
        addIssue(result, {
            type: 'error',
            code: 'PROJECT_INVALID_DEFAULT_LOCALE',
            message: 'Project "defaultLocale" must be a non-empty string.',
            path: 'defaultLocale'
        });
    }

    // supportedLocales: optional, must be array of strings if present
    if (project.supportedLocales !== undefined) {
        if (!Array.isArray(project.supportedLocales)) {
            addIssue(result, {
                type: 'error',
                code: 'PROJECT_INVALID_SUPPORTED_LOCALES',
                message: 'Project "supportedLocales" must be an array of strings if provided.',
                path: 'supportedLocales'
            });
        } else {
            project.supportedLocales.forEach((locale, index) => {
                if (typeof locale !== 'string') {
                    addIssue(result, {
                        type: 'error',
                        code: 'PROJECT_INVALID_LOCALE',
                        message: 'Each supported locale must be a string.',
                        path: `supportedLocales[${index}]`
                    });
                }
            });
        }
    }

    // users: optional, array of strings
    if (project.users !== undefined) {
        if (!Array.isArray(project.users)) {
            addIssue(result, {
                type: 'error',
                code: 'PROJECT_INVALID_USERS',
                message: 'Project "users" must be an array of strings if provided.',
                path: 'users'
            });
        } else {
            project.users.forEach((user, index) => {
                if (typeof user !== 'string') {
                    addIssue(result, {
                        type: 'error',
                        code: 'PROJECT_INVALID_USER',
                        message: 'Each user in "users" must be a string.',
                        path: `users[${index}]`
                    });
                }
            });
        }
    }

    return result;
}
