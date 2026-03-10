import { Layout } from '@moteur/types/Layout.js';
import { ValidationResult } from '@moteur/types/ValidationResult.js';
import { createValidationResult, addIssue } from '../utils/validation.js';
import { BlockRegistry } from '../registry/BlockRegistry.js';
import fieldRegistry from '../registry/FieldRegistry.js';
import { validateFieldValue } from './validateFieldValue.js';
import type { Field } from '@moteur/types/Field.js';

const blockRegistry = new BlockRegistry();

export interface ValidateLayoutOptions {
    /** Project's configured locales (defaultLocale + supportedLocales). Used to validate block.locales. */
    projectLocales?: string[];
}

export function validateLayout(layout: Layout, options?: ValidateLayoutOptions): ValidationResult {
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

        const schemaFields = blockSchema.fields || {};
        for (const fieldName of Object.keys(schemaFields)) {
            const fieldDef = schemaFields[fieldName] as Field;
            const fieldValue = blockInstance.data?.[fieldName];
            const fieldPath = `${blockPath}.data.${fieldName}`;

            if (fieldValue === undefined || fieldValue === null) {
                const isRequired = fieldDef.required === true;
                addIssue(result, {
                    type: isRequired ? 'error' : 'warning',
                    code: isRequired ? 'LAYOUT_REQUIRED_FIELD' : 'LAYOUT_MISSING_FIELD',
                    message: isRequired
                        ? `Required field "${fieldName}" is missing.`
                        : `Optional field "${fieldName}" has no value.`,
                    path: fieldPath
                });
                continue;
            }

            if (!fieldRegistry.get(fieldDef.type)) {
                addIssue(result, {
                    type: 'error',
                    code: 'LAYOUT_UNKNOWN_FIELD_TYPE',
                    message: `Field "${fieldName}" uses unknown field type "${fieldDef.type}".`,
                    path: fieldPath
                });
                continue;
            }

            const issues = validateFieldValue(fieldValue, fieldDef, fieldPath);
            for (const issue of issues) {
                addIssue(result, issue);
            }
        }

        if (blockInstance.locales != null) {
            if (!Array.isArray(blockInstance.locales)) {
                addIssue(result, {
                    type: 'error',
                    code: 'LAYOUT_INVALID_LOCALES',
                    message: '"locales" should be an array of locale codes.',
                    path: `${blockPath}.locales`
                });
            } else if (options?.projectLocales?.length) {
                const invalid = blockInstance.locales.filter(
                    (lc: string) => !options!.projectLocales!.includes(lc)
                );
                if (invalid.length > 0) {
                    addIssue(result, {
                        type: 'error',
                        code: 'LAYOUT_INVALID_LOCALE_CODES',
                        message: `Invalid locale code(s): ${invalid.join(', ')}. Must be one of: ${options.projectLocales.join(', ')}.`,
                        path: `${blockPath}.locales`
                    });
                }
            }
        }

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
