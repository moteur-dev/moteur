import fieldRegistry from '../../registry/FieldRegistry';

fieldRegistry.register({
    type: 'core/color',
    label: 'Color',
    description: 'A hexadecimal color field.',
    storeDirect: true,
    fields: {
        color: {
            type: 'core/text',
            label: 'Color Value',
            description: 'The hexadecimal color value.',
            required: true
        }
    },
    optionsSchema: {
        allowAlpha: {
            type: 'core/boolean',
            default: false,
            description: 'Allow transparency (alpha channel).'
        },
        presetColors: {
            type: 'core/list',
            label: 'Preset Colors',
            description: 'An optional list of preset color swatches to choose from.'
        },
        allowCustom: {
            type: 'core/boolean',
            default: true,
            description: 'Allow users to enter a custom color value.'
        }
    }
});
