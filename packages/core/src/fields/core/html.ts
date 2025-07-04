import fieldRegistry from '../../registry/FieldRegistry';

fieldRegistry.register({
    type: 'core/html',
    label: 'HTML',
    description: 'A field that stores raw HTML content.',
    fields: {
        html: {
            type: 'core/text',
            label: 'HTML Content',
            description: 'The raw HTML content to be stored in this field.',
            multilingual: true,
            required: true
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
        allowedTags: {
            type: 'core/list',
            label: 'Allowed HTML Tags',
            description: 'Restrict HTML tags to a safe subset if needed.',
            optionsSchema: {
                allowEmpty: {
                    type: 'core/boolean',
                    default: true
                }
            }
        }
    }
});
