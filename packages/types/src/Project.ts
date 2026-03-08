import type { AssetType, VideoProviderId } from './Asset.js';
import type { VariantDefinition } from './VariantDefinition.js';
import { Audit } from './Audit';
import { Field } from './Field';

export interface ProjectSchema {
    id: string; // Unique project ID (same as folder name)
    label: string; // Human-readable name
    description?: string; // Optional description
    defaultLocale: string; // Default language for fallbacks
    supportedLocales?: string[]; // Other supported locales

    /** When true, the project is active and available for use. New projects are created with isActive: true. */
    isActive?: boolean;

    users?: string[]; // Optional list of authorized users

    storage?: string; // Storage adapter ID (e.g., 'core/local', 'core/s3')
    storageOptions?: Record<string, any>; // Options for the storage adapter

    plugins?: string[]; // List of plugin IDs to enable for this project

    features?: {
        pages: boolean; // Enable pages & templates
        layouts: boolean; // Enable layouts and blocks
        models: boolean; // Enable models and entries
    };

    namespaces?: string[]; // List of namespaces for this project

    workflow?: {
        enabled: boolean; // default false
        mode: 'auto_publish'; // reviewer approves → auto-publishes
        requireReview: boolean; // if true, authors cannot publish without approval; admins can always bypass
    };

    /** Base URL for the site (e.g. https://example.com). Used for sitemap <loc>; if absent, sitemap uses path-only URLs. */
    siteUrl?: string;

    /** Project API key (one per project). Raw key is never stored; only hash and prefix. */
    apiKey?: {
        hash: string;
        prefix: string; // first 8 chars for display e.g. "mk_live_xxxx..."
        createdAt: string;
    };

    assetConfig?: {
        variants: VariantDefinition[];
        maxUploadSizeMb?: number; // default 50
        allowedTypes?: AssetType[]; // default: all three
        adapter?: 'local' | 's3' | 'r2';
        adapterConfig?: Record<string, any>;
    };

    meta?: {
        audit?: Audit;
    };
}

/** Global instance-level video provider config (not in project.json). */
export interface VideoProvidersConfig {
    active?: VideoProviderId;
    keepLocalCopy?: boolean;
    mux?: {
        tokenId: string;
        tokenSecret: string;
        webhookSecret: string;
    };
    vimeo?: {
        accessToken: string;
        webhookSecret: string;
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
