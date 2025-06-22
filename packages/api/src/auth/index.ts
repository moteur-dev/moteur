import { Router } from 'express';

import login, { openapi as loginSpec, schemas as loginSchemas } from './login';
import providers, { openapi as providersSpec, schemas as providersSchemas } from './providers';
import refresh, { openapi as refreshSpec } from './refresh';
import me, { openapi as meSpec } from './me';
import github, { openapi as githubSpec } from './github';
import google, { openapi as googleSpec } from './google';
import { isGitHubEnabled, isGoogleEnabled } from '@moteur/core/utils/authProviders';

const router = Router();

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
