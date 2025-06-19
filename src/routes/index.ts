import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import dotenv from 'dotenv';

// ESM-safe __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Loading ', resolve(__dirname, '../../.env'));
dotenv.config({ path: resolve(__dirname, '../../.env') });

import express from 'express';
import openapiRoute, { baseSpec } from './openapi';
import swaggerUi from 'swagger-ui-express';

import authRoutes from './auth';
import projectRoutes from './projects';
import { moteurConfig } from '../../moteur.config';

import { authSpecs } from './auth';
import { mergePluginSpecs } from '@/utils/mergePluginSpecs';

const mergedApiSpecs = await mergePluginSpecs({
    ...baseSpec,
    paths: {
        ...baseSpec.paths,
        ...authSpecs.paths
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

const basePath = moteurConfig.api.basePath ?? '/api/moteur';

const router = express.Router();
router.get('/openapi.json', async (req, res) => {
    const spec = mergedApiSpecs;

    res.json(spec);
});

app.use(basePath, router);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(mergedApiSpecs));

app.use(basePath, openapiRoute);
app.use(basePath + '/auth', authRoutes);
app.use(basePath + '/projects', projectRoutes);

const PORT = moteurConfig.api.port || process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Moteur API running at http://localhost:${PORT}`);
});
