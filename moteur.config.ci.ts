import process  from 'node:process';

export const moteurConfig = {
    // Namespaces to load blocks, fields, and structures from
    namespaces: ['core'],

    api: {
        basePath: '/api/moteur',
        port: 3000
    },

    auth: {
        usersFile: 'data/users.json', // default path
        jwtSecret: process.env.JWT_SECRET || 'default_ci_secret', // fallback if needed
        jwtExpiresIn: '1h'
    },

    plans: {
        unlimited: {
            maxProjects: Infinity,
            maxUsers: Infinity,
            maxBlocks: Infinity,
            maxFields: Infinity,
            maxStructures: Infinity
        }
    },

    defaultLocale: 'en',
    supportedLocales: ['en', 'fr'],

    projectRoot: 'data/projects',
    layoutDirectory: 'layouts', // relative to each project
    structureDirectory: 'structures', // relative to each project

    renderer: {
        defaultFormat: 'html', // Default render format
        fallbackBlockType: 'core/fallback', // Block fallback
        fallbackFieldType: 'core/text', // Field fallback
        fallbackLocaleStrategy: 'default' // 'default' | 'first-available' | 'none'
    }
};
