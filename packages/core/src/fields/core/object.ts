import fieldRegistry from '../../registry/FieldRegistry';

fieldRegistry.register({
    type: 'core/object',
    label: 'Object',
    description: 'Flexible key-value object.',
    fields: {
        value: {
            type: 'object',
            label: 'Data',
            description: 'The child fields of this object.',
            required: true
        }
    },
    optionsSchema: {
        allowEmpty: {
            type: 'boolean',
            default: true,
            label: 'Allow Empty',
            description: 'Whether the object can be empty.'
        }
    }
});
