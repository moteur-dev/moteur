import { Audit } from './Audit.js';
import { Field } from './Field.js';

export interface ProjectSchema {
    id: string; // Unique project ID (same as folder name)
    label: string; // Human-readable name
    description?: string; // Optional description
    defaultLocale: string; // Default language for fallbacks
    supportedLocales?: string[]; // Other supported locales

    users?: string[]; // Optional list of authorized users

    features?: {
        pages: boolean; // Enable pages & templates
        layouts: boolean; // Enable layouts and blocks
        models: boolean; // Enable models and entries
    };

    namespaces?: string[]; // List of namespaces for this project

    meta?: {
        audit?: Audit;
    };
}

export const projectSchemaFields: Record<string, Field> = {
    id: {
        type: 'core/text',
        label: 'Project ID',
        description: 'Unique identifier for the project, typically the folder name.'
    },
    label: {
        type: 'core/text',
        label: 'Project Name',
        description: 'Human-readable name for the project.'
    },
    description: {
        type: 'core/text',
        label: 'Description',
        description: 'Optional description of the project.'
    },
    defaultLocale: {
        type: 'core/text',
        label: 'Default Locale',
        description: 'Default language for this project, used for fallbacks.'
    },
    supportedLocales: {
        type: 'core/list',
        label: 'Supported Locales',
        description: 'List of other supported languages for this project.',
        options: {
            itemType: 'core/text',
            allowEmpty: true,
            required: false
        }
    },
    users: {
        type: 'core/list',
        label: 'Authorized Users',
        description: 'Optional list of users authorized to access this project.',
        options: {
            itemType: 'core/text',
            allowEmpty: true,
            required: false
        }
    },
    features: {
        type: 'core/structure',
        label: 'Features',
        description: 'Enable or disable specific features for this project.',
        options: {
            inlineSchema: {
                fields: {
                    pages: {
                        type: 'core/boolean',
                        label: 'Enable Pages',
                        description: 'Enable pages and templates feature.'
                    },
                    layouts: {
                        type: 'core/boolean',
                        label: 'Enable Layouts',
                        description: 'Enable layouts and blocks feature.'
                    },
                    models: {
                        type: 'core/boolean',
                        label: 'Enable Models',
                        description: 'Enable models and entries feature.'
                    }
                }
            }
        }
    }
};
