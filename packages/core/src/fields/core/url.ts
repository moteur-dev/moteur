import fieldRegistry from '../../registry/FieldRegistry.js';

fieldRegistry.register({
    type: 'core/url',
    label: 'URL',
    description: 'A URL field.',
    fields: {
        url: {
            type: 'string',
            label: 'URL',
            description: 'The URL value.',
            multilingual: true,
            required: true
        }
    },
    optionsSchema: {
        ui: {
            type: 'core/text',
            label: 'UI Hint',
            description: 'Optional hint for Studio input rendering. Does not affect stored data.',
            required: false
        }
    }
});
