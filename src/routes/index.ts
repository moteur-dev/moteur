import express from 'express';
import loginRoute from './login.js';
import publicBlocks from './public/blocks.js';
import publicFields from './public/fields.js';
import adminBlocks from './admin/blocks.js';
import adminFields from './admin/fields.js';
import adminStructures from './admin/structures.js';
import adminProjects from './admin/projects.js';
import preview from './public/preview.js';
import { moteurConfig } from '../../moteur.config.js';

const app = express();
app.use(express.json());

// Base API path from config
const basePath = moteurConfig.api.basePath ?? '/api/moteur';

// Request token
app.use('/login', loginRoute);

// Admin routes
app.use(basePath + '/admin/blocks', adminBlocks);
app.use(basePath + '/admin/fields', adminFields);
app.use(basePath + '/admin/projects', adminProjects);
app.use(basePath + '/admin/:project/structures', adminStructures);

// Public routes
app.use(basePath + '/blocks', publicBlocks);
app.use(basePath + '/fields', publicFields);
app.use(basePath + '/preview', preview);

const PORT = moteurConfig.api.port || process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Moteur API running at http://localhost:${PORT}`);
    const routes: { methods: string[]; path: string }[] = [];

    const parseRoute = (def: any) => {
        if (def.route) {
            routes.push({ path: def.route.path, methods: Object.keys(def.route.methods) });
        } else if (def.name === 'router') {
            // nested route (sub router)..
            def.handle.stack.forEach(parseRoute);
        }
    };

    // loop over and parse routes
    app._router.stack.forEach(parseRoute);

    console.log(routes);
});
