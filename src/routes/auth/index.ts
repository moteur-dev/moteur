import { Router } from 'express';

import login, { openapi as loginSpec, schemas as loginSchemas } from './login';
import refresh, { openapi as refreshSpec } from './refresh'
import me, { openapi as meSpec } from './me'
const router = Router();

router.use(login);
router.use(refresh);
router.use(me);

export const authSpecs = {
    paths: {
        ...loginSpec,
        ...refreshSpec,
        ...meSpec
    },
    schemas: {
        ...loginSchemas
    }
};

export default router;
