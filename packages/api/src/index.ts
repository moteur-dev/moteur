import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import dotenv from 'dotenv';

// Load env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../../../.env') });

import express, { Router } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import swaggerUi from 'swagger-ui-express';

import openapiRoute, { baseSpec } from './openapi.js';
import aiRoutes, { aiSpecs } from './ai/index.js';
import authRoutes, { authSpecs } from './auth/index.js';
import projectRoutes, { projectsSpecs } from './projects/index.js';
import blueprintsRoutes, {
    openapi as blueprintsSpec,
    schemas as blueprintsSchemas
} from './blueprints/index.js';
import modelsRoute, { modelsSpecs } from './models/index.js';
import entriesRoute, { entriesSpecs } from './entries/index.js';

import { mergePluginSpecs } from './utils/mergePluginSpecs.js';

import { createPresenceServer } from '@moteur/presence';
import { validateStorageConfig } from '@moteur/core/config/storageConfig.js';

// CORS: restrict to explicit origins. Set CORS_ORIGINS (comma-separated) in production.
function getCorsOrigin(): string | string[] {
    const env = process.env.CORS_ORIGINS?.trim();
    if (env) {
        return env
            .split(',')
            .map(s => s.trim())
            .filter(Boolean);
    }
    return ['http://localhost:3000', 'http://localhost:5173'];
}

// Create Express app
const app = express();
app.use(express.json());
app.use(
    cors({
        origin: getCorsOrigin(),
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    })
);

const basePath = process.env.API_BASE_PATH || '';

const mergedApiSpecs = await mergePluginSpecs({
    ...baseSpec,
    paths: {
        ...baseSpec.paths,
        ...aiSpecs.paths,
        ...authSpecs.paths,
        ...projectsSpecs.paths,
        ...blueprintsSpec,
        ...modelsSpecs.paths,
        ...entriesSpecs.paths
    },
    components: {
        ...baseSpec.components,
        schemas: {
            ...baseSpec.components?.schemas,
            ...authSpecs.schemas,
            ...projectsSpecs.schemas,
            ...blueprintsSchemas
        }
    }
});

const router: Router = express.Router();
router.get('/openapi.json', async (req, res) => {
    res.json(mergedApiSpecs);
});

app.use(basePath, router);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(mergedApiSpecs));

app.use(basePath, openapiRoute);
app.use(basePath + '/auth', authRoutes);
app.use(basePath + '/ai', aiRoutes);
app.use(basePath + '/blueprints', blueprintsRoutes);
app.use(basePath + '/projects', projectRoutes);
app.use(basePath + '/projects/:projectId/models', modelsRoute);
app.use(basePath + '/projects/:projectId/models/:modelId/entries', entriesRoute);

// Global error handler: centralizes errors and avoids leaking stack traces
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const status = err.status ?? err.statusCode ?? 500;
    const message = err.message ?? 'Internal server error';
    if (process.env.NODE_ENV !== 'production') {
        console.error('[API error]', err);
    }
    res.status(typeof status === 'number' ? status : 500).json({
        error: message,
        ...(process.env.NODE_ENV !== 'production' && err.stack ? { details: err.stack } : {})
    });
});

// 🔧 Create HTTP server wrapper
const httpServer = createServer(app);

// ✅ Plug in presence socket engine
createPresenceServer(httpServer);

// Validate storage paths before accepting connections
validateStorageConfig();

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`Moteur API running at http://localhost:${PORT}`);
});
