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

import { baseSpec } from './openapi.js';
import aiRoutes, { aiSpecs } from './ai/index.js';
import authRoutes, { authSpecs } from './auth/index.js';
import projectRoutes, { projectsSpecs } from './projects/index.js';
import blueprintsRoutes, {
    openapi as blueprintsSpec,
    schemas as blueprintsSchemas
} from './blueprints/index.js';
import modelsRoute, { modelsSpecs } from './models/index.js';
import entriesRoute, { entriesSpecs } from './entries/index.js';
import activityGlobalRoute, { openapi as activityGlobalSpec } from './activity/index.js';
import adminRoutes, { adminSpecs } from './admin/index.js';
import adminUsageRouter, { openapi as adminUsageSpec } from './admin/usage.js';
import adminAssetsMigrateRouter from './admin/assets/migrate.js';
import blocksRouter from './public/blocks.js';
import webhooksAssetsRouter from './webhooks/assets.js';
import path from 'path';
import fs from 'fs';
import { storageConfig } from '@moteur/core/config/storageConfig.js';

import { mergePluginSpecs } from './utils/mergePluginSpecs.js';
import { requestClassifier } from './middlewares/requestClassifier.js';
import { usageLogging } from './middlewares/usageLogging.js';
import { adminRateLimiter, publicRateLimitGate } from './middlewares/rateLimit.js';
import { securityHeaders } from './middlewares/security.js';

import { createPresenceServer } from '@moteur/presence';
import { validateStorageConfig } from '@moteur/core/config/storageConfig.js';
import { onEvent } from '@moteur/core/utils/eventBus.js';
import { schedulerEngine } from '@moteur/core';

// Load core so activity log plugin registers and writes activity on resource changes
import '@moteur/core';
// Ensure asset storage adapters (e.g. local) are registered before any asset routes run
import '@moteur/core/assets/index.js';
import { setVideoProvidersConfig } from '@moteur/core/assets/providerRegistry.js';

if (process.env.MUX_TOKEN_ID && process.env.MUX_TOKEN_SECRET && process.env.MUX_WEBHOOK_SECRET) {
    setVideoProvidersConfig({
        active: 'mux',
        keepLocalCopy: process.env.MUX_KEEP_LOCAL_COPY === 'true',
        mux: {
            tokenId: process.env.MUX_TOKEN_ID,
            tokenSecret: process.env.MUX_TOKEN_SECRET,
            webhookSecret: process.env.MUX_WEBHOOK_SECRET
        }
    });
} else if (process.env.VIMEO_ACCESS_TOKEN && process.env.VIMEO_WEBHOOK_SECRET) {
    setVideoProvidersConfig({
        active: 'vimeo',
        keepLocalCopy: process.env.VIMEO_KEEP_LOCAL_COPY === 'true',
        vimeo: {
            accessToken: process.env.VIMEO_ACCESS_TOKEN,
            webhookSecret: process.env.VIMEO_WEBHOOK_SECRET
        }
    });
}

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

const basePath = process.env.API_BASE_PATH || '';

// Webhooks need raw body for signature verification (mount before json parser)
app.use(
    basePath + '/webhooks',
    express.raw({ type: 'application/json', limit: '1mb' }),
    (req: any, _res, next) => {
        if (Buffer.isBuffer(req.body)) req.rawBody = req.body.toString('utf8');
        next();
    },
    webhooksAssetsRouter
);

const bodyLimit = process.env.API_BODY_LIMIT || '1mb';
app.use(express.json({ limit: bodyLimit }));

app.use(securityHeaders);
app.use(
    cors({
        origin: getCorsOrigin(),
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
    })
);

// Request classification (admin vs public), usage logging, and rate limiting
app.use(basePath, requestClassifier);
app.use(basePath, usageLogging);
app.use(basePath + '/admin', adminRateLimiter);
app.use(basePath, publicRateLimitGate);

const mergedApiSpecs = await mergePluginSpecs({
    ...baseSpec,
    paths: {
        ...baseSpec.paths,
        ...aiSpecs.paths,
        ...authSpecs.paths,
        ...projectsSpecs.paths,
        ...blueprintsSpec,
        ...activityGlobalSpec,
        ...modelsSpecs.paths,
        ...entriesSpecs.paths,
        ...adminSpecs.paths,
        ...adminUsageSpec
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

app.use(basePath + '/auth', authRoutes);
app.use(basePath + '/ai', aiRoutes);
app.use(basePath + '/blueprints', blueprintsRoutes);
app.use(basePath + '/activity', activityGlobalRoute);
app.use(basePath + '/projects', projectRoutes);
app.use(basePath + '/projects/:projectId/models', modelsRoute);
app.use(basePath + '/projects/:projectId/models/:modelId/entries', entriesRoute);
app.use(basePath + '/admin/usage', adminUsageRouter);
app.use(basePath + '/admin/projects', adminRoutes);
app.use(basePath + '/admin/assets', adminAssetsMigrateRouter);
app.use('/api/moteur/blocks', blocksRouter);

// Static assets (local adapter): GET /static/assets/:projectId/:variantKey/:filename
app.get(
    '/static/assets/:projectId/:variantKey/:filename',
    (req: express.Request, res: express.Response): void => {
        const { projectId, variantKey, filename } = req.params;
        const projectsDir = storageConfig.projectsDir;
        const filePath = path.join(projectsDir, projectId, 'assets', variantKey, filename);
        if (!path.normalize(filePath).startsWith(path.join(projectsDir, projectId))) {
            res.status(400).end();
            return;
        }
        if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
            res.status(404).end();
            return;
        }
        res.sendFile(filePath);
    }
);

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

// ✅ Plug in presence socket engine and broadcast activity events to project room
const io = createPresenceServer(httpServer);
onEvent('activity.logged', async ctx => {
    try {
        io.to(ctx.event.projectId).emit('activity:event', ctx.event);
    } catch {
        // never break on emit failure
    }
});

// Broadcast comment events to project room for real-time studio updates
onEvent('comment.added', async ctx => {
    try {
        io.to(ctx.projectId).emit('comment:added', ctx.comment);
    } catch {
        // never break on emit failure
    }
});
onEvent('comment.resolved', async ctx => {
    try {
        io.to(ctx.projectId).emit('comment:resolved', ctx.comment);
    } catch {
        // never break on emit failure
    }
});
onEvent('comment.deleted', async ctx => {
    try {
        io.to(ctx.projectId).emit('comment:deleted', { id: ctx.id });
    } catch {
        // never break on emit failure
    }
});
onEvent('comment.edited', async ctx => {
    try {
        io.to(ctx.projectId).emit('comment:edited', ctx.comment);
    } catch {
        // never break on emit failure
    }
});

// Broadcast review events to project room
onEvent('review.submitted', async ctx => {
    try {
        io.to(ctx.projectId).emit('review:submitted', ctx.review);
    } catch {
        // never break on emit failure
    }
});
onEvent('review.approved', async ctx => {
    try {
        io.to(ctx.projectId).emit('review:approved', ctx.review);
    } catch {
        // never break on emit failure
    }
});
onEvent('review.rejected', async ctx => {
    try {
        io.to(ctx.projectId).emit('review:rejected', ctx.review);
    } catch {
        // never break on emit failure
    }
});
onEvent('review.entryStatusChanged', async ctx => {
    try {
        io.to(ctx.projectId).emit('review:status_changed', {
            entryId: ctx.entryId,
            modelId: ctx.modelId,
            status: ctx.status
        });
    } catch {
        // never break on emit failure
    }
});
onEvent('review.pageStatusChanged', async ctx => {
    try {
        io.to(ctx.projectId).emit('review:status_changed', {
            pageId: ctx.pageId,
            templateId: ctx.templateId,
            status: ctx.status
        });
    } catch {
        // never break on emit failure
    }
});

onEvent('asset:ready', async ctx => {
    try {
        io.to(ctx.asset.projectId).emit('asset:ready', ctx.asset);
    } catch {
        // never break on emit failure
    }
});
onEvent('asset:error', async ctx => {
    try {
        io.to(ctx.projectId).emit('asset:error', {
            id: ctx.id,
            projectId: ctx.projectId,
            error: ctx.error
        });
    } catch {
        // never break on emit failure
    }
});

// Validate storage paths before accepting connections
validateStorageConfig();

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, async () => {
    console.log(`Moteur API running at http://localhost:${PORT}`);
    try {
        await schedulerEngine.init();
    } catch (err) {
        console.error('[Moteur] Scheduler init failed:', err);
    }
});

function gracefulShutdown(): void {
    schedulerEngine.stopSweep();
    process.exit(0);
}
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
