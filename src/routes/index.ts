import express from 'express';
import authRoutes from './auth';
import projectRoutes from './projects';
import { moteurConfig } from '../../moteur.config';

const app = express();
app.use(express.json());

const basePath = moteurConfig.api.basePath ?? '/api/moteur';
app.use(basePath + '/auth', authRoutes);
app.use(basePath + '/projects', projectRoutes);

const PORT = moteurConfig.api.port || process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Moteur API running at http://localhost:${PORT}`);
});
