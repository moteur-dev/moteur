import type { OpenAPIV3 } from 'openapi-types';

export const openApiSpec: OpenAPIV3.Document = {
    openapi: '3.0.0',
    info: {
        title: 'Moteur REST API',
        version: '1.0.0',
        description: 'Moteur API for structured content, layouts, and plugins'
    },
    servers: [{ url: '/api/moteur' }],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            }
        }
    },
    security: [{ bearerAuth: [] }],
    paths: {} // will be merged dynamically
};
