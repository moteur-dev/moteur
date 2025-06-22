import { Router } from 'express';
//import { validateBlock } from '../../../validators/validateBlock';
//import { listFields } from '../../../api/fields';
//import { loadFieldValidators } from '../../../api/fieldValidators';

const router: Router = Router();

router.post('/block', async (req: any, res: any) => {
    const { block, schema } = req.body;

    if (!block || !schema) {
        return res.status(400).json({
            valid: false,
            issues: [{ type: 'error', message: 'Missing "block" or "schema" in request body.' }]
        });
    }

    try {
        /*const fieldRegistry = await listFields();
    const validators = loadFieldValidators();
    const result = validateBlock(block, schema, fieldRegistry, validators);
    return reson(result);*/
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';

        return res.status(500).json({
            valid: false,
            issues: [
                {
                    type: 'error',
                    message: 'Internal server error during block validation.',
                    context: { error: errorMessage }
                }
            ]
        });
    }
});

export default router;
