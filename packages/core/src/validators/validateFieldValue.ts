import { Field } from '@moteur/types/Field.js';
import { ValidationIssue } from '@moteur/types/ValidationResult.js';
import fieldRegistry from '../registry/FieldRegistry.js';

import { validateTextField } from './fields/core/validateTextField.js';
import { validateNumberField } from './fields/core/validateNumberField.js';
import { validateBooleanField } from './fields/core/validateBooleanField.js';
import { validateColorField } from './fields/core/validateColorField.js';
import { validateDateTimeField } from './fields/core/validateDatetimeField.js';
import { validateMarkdownField } from './fields/core/validateMarkdownField.js';
import { validateHtmlField } from './fields/core/validateHtmlField.js';
import { validateListField } from './fields/core/validateListField.js';
import { validateObjectField } from './fields/core/validateObjectField.js';
import { validateStructureField } from './fields/core/validateStructureField.js';
import { validateSlugField } from './fields/core/validateSlugField.js';
import { validateTagsField } from './fields/core/validateTagsField.js';
import { validateTableField } from './fields/core/validateTableField.js';
import { validateEmailField } from './fields/core/validateEmailField.js';
import { validateJsonField } from './fields/core/validateJsonField.js';
import { validateMultiSelectField } from './fields/core/validateMultiSelectField.js';
import { validateSelectField } from './fields/core/validateSelectField.js';
import { validateRelationField } from './fields/core/validateRelationField.js';
import { validateRelationsField } from './fields/core/validateRelationsField.js';
import { validateImageField } from './fields/core/validateImageField.js';
import { validateLinkField } from './fields/core/validateLinkField.js';

/**
 * Resolves the actual value to validate, unwrapping the `{ value: ... }`
 * envelope for non-storeDirect fields that follow the standard convention.
 * Fields with custom envelope shapes (e.g. core/color) handle their own unwrapping.
 */
function resolveValue(value: any, fieldType: string): any {
    const schema = fieldRegistry.get(fieldType);
    if (!schema || schema.storeDirect !== false) return value;
    return value?.value;
}

export function validateFieldValue(value: any, field: Field, path: string): ValidationIssue[] {
    const resolved = resolveValue(value, field.type);

    switch (field.type) {
        case 'core/text':
        case 'core/textarea':
        case 'core/url':
        case 'core/phone':
        case 'core/icon':
            return validateTextField(resolved, field, path);

        case 'core/rich-text':
            return validateTextField(resolved, field, path);

        case 'core/html':
            return validateHtmlField(resolved, field, path);

        case 'core/email':
            return validateEmailField(resolved, field, path);

        case 'core/number':
        case 'core/order':
            return validateNumberField(resolved, field, path);

        case 'core/boolean':
            return validateBooleanField(resolved, field, path);

        case 'core/color':
            // Color uses { color: "..." } envelope, not { value: ... }
            return validateColorField(value, field, path);

        case 'core/datetime':
        case 'core/date':
        case 'core/time':
            return validateDateTimeField(resolved, field, path);

        case 'core/markdown':
            return validateMarkdownField(resolved, field, path);

        case 'core/list':
            return validateListField(resolved, field, path);

        case 'core/object':
            return validateObjectField(resolved, field, path);

        case 'core/structure':
            return validateStructureField(value, field, path);

        case 'core/slug':
            return validateSlugField(resolved, field, path);

        case 'core/tags':
        case 'core/categories':
            return validateTagsField(resolved, field, path);

        case 'core/table':
            return validateTableField(resolved, field, path);

        case 'core/multi-select':
            return validateMultiSelectField(resolved, field, path);

        case 'core/json':
            return validateJsonField(resolved, field, path);

        case 'core/select':
        case 'core/status':
            return validateSelectField(resolved, field, path);

        case 'core/relation':
            return validateRelationField(resolved, field, path);

        case 'core/relations':
            return validateRelationsField(resolved, field, path);

        case 'core/image':
            return validateImageField(value, field, path);

        case 'core/link':
            return validateLinkField(value, field, path);

        case 'core/id':
            return validateTextField(resolved, field, path);

        case 'core/asset':
        case 'core/asset-list':
        case 'core/video':
        case 'core/model-3d':
        case 'core/address':
        case 'core/geo':
            return [];

        default:
            return [
                {
                    type: 'warning',
                    code: 'NO_FIELD_VALIDATOR',
                    message: `No validator available for field type "${field.type}".`,
                    path,
                    context: { value }
                }
            ];
    }
}
