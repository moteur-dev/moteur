import fs from 'fs';
import path from 'path';
import { validateLayout } from '../../validators/validateLayout.js';
import { validateBlock } from '../../validators/validateBlock.js';
import { validateStructure } from '../../validators/validateStructure.js';
import { listBlocks } from '../../api/blocks.js';
import { listFields } from '../../api/fields.js';
//import { printValidationResult } from '../../utils/printValidation.js';
//import { loadFieldValidators } from '../../../api/fieldValidators.js';

function parseArgs(args: string[]): Record<string, string> {
    const result: Record<string, string> = {};
    for (let i = 0; i < args.length; i += 2) {
        const key = args[i];
        const value = args[i + 1];
        if (key.startsWith('--') && value) {
            result[key.slice(2)] = value;
        }
    }
    return result;
}

export async function runValidateCommand(type: string, args: any) {
    const options = parseArgs(args);

    if (!options.file) {
        console.error('Missing --file option');
        process.exit(1);
    }

    const filePath = path.resolve(options.file);
    const rawData = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(rawData);

    const fields = await listFields();

    switch (type) {
        case 'layout': {
            const blocks = await listBlocks();
            //const result = validateLayout(data, blocks, fields);
            //printValidationResult(result);
            break;
        }

        case 'block': {
            if (!options.type) {
                console.error('Missing --type option for block');
                process.exit(1);
            }
            const blocks = await listBlocks();
            //const validators = loadFieldValidators();
            const schema = blocks[options.type];
            if (!schema) {
                console.error(`Unknown block type "${options.type}"`);
                process.exit(1);
            }
            //const result = validateBlock(data, schema, fields, validators);
            //printValidationResult(result);
            break;
        }

        case 'structure': {
            //const structure = resolveInputData(options.file || options.data);
            /*if (!structure) {
        console.error('❌ --file or --data is required for structure validation');
        process.exit(1);
      }*/

            const fieldRegistry = await listFields();
            //const result = validateStructure(structure, fieldRegistry);
            //printValidationResult(result);
            break;
        }

        default:
            console.error(`Unknown validation type: ${type}`);
            process.exit(1);
    }
}
