import fieldRegistry from '../../registry/FieldRegistry';

fieldRegistry.register({
    type: 'core/text',
    label: 'Text',
    description: 'A single-line string field with multilingual support.',
    fields: {
        text: {
            type: 'string',
            label: 'Text',
            description: 'The text value of the field.',
            required: true,
            multilingual: true
        }
    },
    optionsSchema: {
        maxLength: {
            type: 'core/number',
            default: 255,
            label: 'Max Length',
            description: 'Maximum length of the text field.'
        },
        minLength: {
            type: 'core/number',
            default: 1,
            label: 'Min Length',
            description: 'Minimum length of the text field.'
        },
        allowEmpty: {
            type: 'core/boolean',
            default: false,
            label: 'Allow Empty',
            description: 'Whether the field can be empty.'
        },
        validation: {
            type: 'core/object',
            label: 'Validation',
            description: 'Validation rules for the text field.',
            properties: {
                pattern: {
                    type: 'string',
                    default: '^[a-zA-Z0-9_\\- ]*$',
                    label: 'Pattern',
                    description: 'Regular expression pattern for validation.'
                },
                message: {
                    type: 'string',
                    default:
                        'Only alphanumeric characters, underscores, hyphens, and spaces are allowed.',
                    label: 'Error Message',
                    description: 'Error message when validation fails.'
                }
            }
        },
        placeholder: {
            type: 'core/string',
            default: '',
            label: 'Placeholder',
            description: 'Placeholder text for the field.'
        },
        autocomplete: {
            type: 'core/boolean',
            default: false,
            label: 'Enable autocomplete',
            description: 'Whether to enable autocomplete for the field.'
        }
    }
});
