import { Field } from '@moteur/types/Field';
import { ValidationIssue } from '@moteur/types/ValidationResult';

// Core validators
import { validateTextField } from './fields/core/validateTextField';
import { validateNumberField } from './fields/core/validateNumberField';
import { validateBooleanField } from './fields/core/validateBooleanField';
import { validateColorField } from './fields/core/validateColorField';
import { validateDateTimeField } from './fields/core/validateDatetimeField';
import { validateMarkdownField } from './fields/core/validateMarkdownField';
import { validateListField } from './fields/core/validateListField';
import { validateObjectField } from './fields/core/validateObjectField';
import { validateStructureField } from './fields/core/validateStructureField';

export function validateFieldValue(value: any, field: Field, path: string): ValidationIssue[] {
    switch (field.type) {
        case 'core/text':
        case 'core/textarea':
        case 'core/html':
        case 'core/url':
            return validateTextField(value, field, path);

        case 'core/number':
            return validateNumberField(value, field, path);

        case 'core/boolean':
            return validateBooleanField(value, field, path);

        case 'core/color':
            return validateColorField(value, field, path);

        case 'core/datetime':
            return validateDateTimeField(value, field, path);

        case 'core/markdown':
            return validateMarkdownField(value, field, path);

        case 'core/list':
            return validateListField(value, field, path);

        case 'core/object':
            return validateObjectField(value, field, path);

        case 'core/structure':
            return validateStructureField(value, field, path);

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
