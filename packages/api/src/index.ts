import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import dotenv from 'dotenv';

import express, { Router } from 'express';
import { createServer } from 'http';
import swaggerUi from 'swagger-ui-express';

import openapiRoute, { baseSpec } from './openapi';
import authRoutes from './auth';
import projectRoutes from './projects';
import modelsRoute from './models';
import entriesRoute from './entries';

import { authSpecs } from './auth';
import { projectsSpecs } from './projects';
import { modelsSpecs } from './models';
import { mergePluginSpecs } from './utils/mergePluginSpecs';

import { createPresenceServer } from '@moteur/presence';

// Load env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../../.env') });

// Create Express app
const app = express();
app.use(express.json());

const basePath = process.env.API_BASE_PATH || '';

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
