import { Layout } from '@moteur/types/Layout';

import { ValidationResult } from '@moteur/types/ValidationResult';
import { createValidationResult, addIssue } from '../utils/validation';
import { BlockRegistry } from '../registry/BlockRegistry';
import fieldRegistry from '../registry/FieldRegistry';

const blockRegistry = new BlockRegistry();

export function validateLayout(
    layout: Layout /*,
    blockRegistry: BlockRegistry,
    fieldRegistry: FieldRegistry*/
): ValidationResult {
    const result = createValidationResult();

    if (!layout || !Array.isArray(layout.blocks)) {
        addIssue(result, {
            type: 'error',
            code: 'LAYOUT_MISSING_BLOCKS',
            message: 'Layout must contain a "blocks" array.',
            path: 'blocks'
        });
        return result;
    }

    layout.blocks.forEach((blockInstance, index) => {
        const blockPath = `blocks[${index}]`;
        const blockType = blockInstance.type;

        // 1. Validate block type exists
        const blockSchema = blockRegistry.get(blockType);
        if (!blockSchema) {
            addIssue(result, {
                type: 'error',
                code: 'LAYOUT_UNKNOWN_BLOCK_TYPE',
                message: `Unknown block type "${blockType}".`,
                path: `${blockPath}.type`
            });
            return;
        }

        // 2. Validate required fields
        const schemaFields = blockSchema.fields || {};
        for (const fieldName of Object.keys(schemaFields)) {
            const fieldDef = schemaFields[fieldName];
            const fieldValue = blockInstance.data?.[fieldName];

            if (fieldValue === undefined || fieldValue === null) {
                addIssue(result, {
                    type: 'warning',
                    code: 'LAYOUT_MISSING_FIELD',
                    message: `Missing value for field "${fieldName}".`,
                    path: `${blockPath}.fields.${fieldName}`
                });
                continue;
            }

            // 3. Basic field type check (only string/number/array checks for now)
            const expectedFieldType = fieldDef.type;
            if (!fieldRegistry.get(expectedFieldType)) {
                addIssue(result, {
                    type: 'error',
                    code: 'LAYOUT_UNKNOWN_FIELD_TYPE',
                    message: `Field "${fieldName}" uses unknown field type "${expectedFieldType}".`,
                    path: `${blockPath}.fields.${fieldName}`
                });
                continue;
            }

            // Optional: Validate type of value (shallow check)
            const isValid = validateFieldValue(expectedFieldType, fieldValue);
            if (!isValid) {
                addIssue(result, {
                    type: 'warning',
                    code: 'LAYOUT_INVALID_FIELD_TYPE',
                    message: `Field "${fieldName}" has a value that does not match expected type "${expectedFieldType}".`,
                    path: `${blockPath}.fields.${fieldName}`,
                    context: { value: fieldValue }
                });
            }
        }

        // 4. Validate locales
        /*if (blockInstance.locales && !Array.isArray(blockInstance.locales)) {
      addIssue(result, {
        type: 'warning',
        code: 'LAYOUT_INVALID_LOCALES',
        message: `"locales" should be an array of locale codes.`,
        path: `${blockPath}.locales`,
      });
    }*/

        // 5. Validate conditions (basic structure only for now)
        if (blockInstance.conditions && typeof blockInstance.conditions !== 'object') {
            addIssue(result, {
                type: 'warning',
                code: 'LAYOUT_INVALID_CONDITIONS',
                message: `"conditions" should be an object with condition rules.`,
                path: `${blockPath}.conditions`
            });
        }
    });

    return result;
}

function validateFieldValue(type: string, value: any): boolean {
    switch (type) {
        case 'core/text':
        case 'core/rich-text':
        case 'core/link':
            return typeof value === 'string' || typeof value === 'object';
        case 'core/image':
            return typeof value === 'object' && value !== null;
        case 'core/list':
            return Array.isArray(value);
        case 'core/structure':
            return typeof value === 'object' && value !== null;
        default:
            return true; // Unknown types default to "assume valid"
    }
}
