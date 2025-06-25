import { Router } from 'express';

import { mergePathSpecs } from '../utils/mergePathSpecs';

import getAll, { openapi as getAllSpec } from './getAll';
import getOne, { openapi as getOneSpec } from './getOne';
import create, { openapi as createSpec, schemas as createSchemas } from './create';
import update, { openapi as updateSpec } from './update';
import remove, { openapi as deleteSpec } from './delete';

import presenceFormState, { openapi as presenceFormStateSpec } from './presence/formState';
import debug, { openapi as debugSpec } from './presence/debug';

const router: Router = Router();

router.use(getAll);
router.use(getOne);
router.use(create);
router.use(update);
router.use(remove);
router.use(presenceFormState);
router.use(debug);

export const projectsSpecs = {
    paths: mergePathSpecs(
        getAllSpec,
        getOneSpec,
        createSpec,
        updateSpec,
        deleteSpec,
        presenceFormStateSpec,
        debugSpec
    ),
    schemas: {
        ...createSchemas
    }
};

export default router;
