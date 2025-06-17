import express from 'express';
import loginRoute from './auth/login';
import refreshRoute from './auth/refresh';
import publicBlocks from './public/blocks';
import publicFields from './public/fields';
import adminBlocks from './admin/blocks';
import adminFields from './admin/fields';
import adminStructures from './admin/structures';
import adminProjects from './admin/projects';
import preview from './public/preview';
import { moteurConfig } from '../../moteur.config';
import { loginUser } from '../api/auth';

const app = express();
app.use(express.json());

// Base API path from config
const basePath = moteurConfig.api.basePath ?? '/api/moteur';
console.log(`Using base path: ${basePath}`);

app.use(basePath + '/auth', loginRoute);
app.use(basePath + '/auth', refreshRoute);

// Admin routes
app.use(basePath + '/blocks', adminBlocks);
app.use(basePath + '/fields', adminFields);
app.use(basePath + '/projects', adminProjects);
app.use(basePath + '/:project/structures', adminStructures);

app.use(basePath + '/preview', preview);

const PORT = moteurConfig.api.port || process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Moteur API running at http://localhost:${PORT}`);
});
