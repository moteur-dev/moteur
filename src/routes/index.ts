import express from 'express';
import openapiRoute, { baseSpec } from './openapi';

import authRoutes from './auth';
import projectRoutes from './projects';
import { moteurConfig } from '../../moteur.config';

import { authSpecs } from './auth';
import { mergePluginSpecs } from '@/utils/mergePluginSpecs';

const app = express();
app.use(express.json());

const basePath = moteurConfig.api.basePath ?? '/api/moteur';

const router = express.Router();
router.get('/openapi.json', async (req, res) => {
    const spec = await mergePluginSpecs({
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

    res.json(spec);
});
app.use(basePath, router);

app.use(basePath, openapiRoute);
app.use(basePath + '/auth', authRoutes);
app.use(basePath + '/projects', projectRoutes);

const PORT = moteurConfig.api.port || process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Moteur API running at http://localhost:${PORT}`);
});
