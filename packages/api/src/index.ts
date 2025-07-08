import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import dotenv from 'dotenv';

// Load env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../../.env') });

import express, { Router } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import swaggerUi from 'swagger-ui-express';

import openapiRoute, { baseSpec } from './openapi';
import authRoutes, { authSpecs } from './auth';
import projectRoutes, { projectsSpecs } from './projects';
import modelsRoute, { modelsSpecs } from './models';
import entriesRoute, { entriesSpecs } from './entries';

import { mergePluginSpecs } from './utils/mergePluginSpecs';

import { createPresenceServer } from '@moteur/presence';

// Create Express app
const app = express();
app.use(express.json());
app.use(
    cors({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    })
);

const basePath = process.env.API_BASE_PATH || '';

const mergedApiSpecs = await mergePluginSpecs({
    ...baseSpec,
    paths: {
        ...baseSpec.paths,
        ...authSpecs.paths,
        ...projectsSpecs.paths,
        ...modelsSpecs.paths,
        ...entriesSpecs.paths
    },
    components: {
        ...baseSpec.components,
        schemas: {
            ...baseSpec.components?.schemas,
            ...authSpecs.schemas,
            ...projectsSpecs.schemas
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
app.use(basePath + '/projects', projectRoutes);
app.use(basePath + '/projects/:projectId/models', modelsRoute);
app.use(basePath + '/projects/:projectId/models/:modelId/entries', entriesRoute);

// 🔧 Create HTTP server wrapper
const httpServer = createServer(app);

// ✅ Plug in presence socket engine
createPresenceServer(httpServer);

// 🟢 Start listening
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`Moteur API running at http://localhost:${PORT}`);
});
