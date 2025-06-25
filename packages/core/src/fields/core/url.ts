import fieldRegistry from '../../registry/FieldRegistry';

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
    }
});
