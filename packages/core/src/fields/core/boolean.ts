import fieldRegistry from '../../registry/FieldRegistry';

fieldRegistry.register({
    type: 'core/boolean',
    label: 'Boolean',
    description: 'A true/false toggle field.',
    storeDirect: true,
    fields: {
        value: {
            type: 'core/boolean',
            label: 'Value',
            description: 'The boolean value of this field.',
            default: false
        }
    },
    optionsSchema: {
        trueLabel: {
            type: 'core/text',
            default: 'Yes',
            label: 'True Label',
            description: 'Label for the true state.'
        },
        falseLabel: {
            type: 'core/text',
            default: 'No',
            label: 'False Label',
            description: 'Label for the false state.'
        }
    }
});
