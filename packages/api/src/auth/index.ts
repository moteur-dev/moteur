import { Router } from 'express';

import login, { openapi as loginSpec, schemas as loginSchemas } from './login.js';
import providers, { openapi as providersSpec, schemas as providersSchemas } from './providers.js';
import refresh, { openapi as refreshSpec } from './refresh.js';
import me, { openapi as meSpec } from './me.js';
import github, { openapi as githubSpec } from './github.js';
import google, { openapi as googleSpec } from './google.js';
import { isGitHubEnabled, isGoogleEnabled } from '../utils/authProviders.js';

const router: Router = Router();

router.use(login);
router.use(providers);
router.use(refresh);
router.use(me);
if (isGitHubEnabled()) {
    router.use(github);
}
if (isGoogleEnabled()) {
    router.use(google);
}

export const authSpecs = {
    paths: {
        ...loginSpec,
        ...providersSpec,
        ...refreshSpec,
        ...meSpec,
        ...(isGitHubEnabled() ? githubSpec : {}),
        ...(isGoogleEnabled() ? googleSpec : {})
    },
    schemas: {
        ...loginSchemas,
        ...providersSchemas
    }
};

export default router;
