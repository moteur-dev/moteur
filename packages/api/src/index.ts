import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import dotenv from 'dotenv';

// ESM-safe __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Loading ', resolve(__dirname, '../../.env'));
dotenv.config({ path: resolve(__dirname, '../../.env') });

import express, { Router } from 'express';
import openapiRoute, { baseSpec } from './openapi';
import swaggerUi from 'swagger-ui-express';

import authRoutes from './auth';
import projectRoutes from './projects';
import modelsRoute from './models';
import entriesRoute from './entries';

import { authSpecs } from './auth';
import { projectsSpecs } from './projects';
import { modelsSpecs } from './models';
import { mergePluginSpecs } from '@moteur/core/utils/mergePluginSpecs';

// Make sure all fields are registered
import '@moteur/core/fields';

const mergedApiSpecs = await mergePluginSpecs({
    ...baseSpec,
    paths: {
        ...baseSpec.paths,
        ...authSpecs.paths,
        ...projectsSpecs.paths,
        ...modelsSpecs.paths
    },
    components: {
        ...baseSpec.components,
        schemas: {
            ...baseSpec.components?.schemas,
            ...authSpecs.schemas
        }
    }
});

const app = express();
app.use(express.json());

const basePath = process.env.API_BASE_PATH || '';

const router: Router = express.Router();
router.get('/openapi.json', async (req, res) => {
    const spec = mergedApiSpecs;

    res.json(spec);
});

app.use(basePath, router);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(mergedApiSpecs));

app.use(basePath, openapiRoute);
app.use(basePath + '/auth', authRoutes);
app.use(basePath + '/projects', projectRoutes);
app.use(basePath + '/projects/:projectId/models', modelsRoute);
app.use(basePath + '/projects/:projectId/models/:modelId/entries', entriesRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Moteur API running at http://localhost:${PORT}`);
});
