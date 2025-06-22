import fieldRegistry from '../../registry/FieldRegistry';

fieldRegistry.register({
    type: 'core/textarea',
    label: 'Text Area',
    description: 'A multi-line string field, useful for paragraphs or descriptions.',
    fields: {
        text: {
            type: 'string',
            label: 'Text',
            multilingual: true,
            required: true
        }
    },
    optionsSchema: {
        placeholder: {
            type: 'string',
            default: '',
            label: 'Placeholder',
            description: 'Optional placeholder text for the textarea.'
        },
        rows: {
            type: 'number',
            default: 3,
            label: 'Visible Rows',
            description: 'Suggested number of visible text lines.'
        },
        allowEmpty: {
            type: 'boolean',
            default: false,
            label: 'Allow Empty',
            description: 'Whether the field can be empty.'
        },
        maxLength: {
            type: 'number',
            label: 'Maximum Length',
            description: 'Maximum number of characters allowed.'
        },
        validation: {
            type: 'object',
            label: 'Validation',
            description: 'Validation rules for the text field.',
            properties: {
                pattern: {
                    type: 'string',
                    label: 'Pattern',
                    description: 'Regular expression pattern for validation.'
                },
                message: {
                    type: 'string',
                    label: 'Error Message',
                    description: 'Error message when validation fails.'
                }
            }
        }
    }
});
