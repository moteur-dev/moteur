import fieldRegistry from '../../registry/FieldRegistry.js';

fieldRegistry.register({
    type: 'core/asset-list',
    label: 'Asset list',
    description: 'List of project asset references with optional usage-level alt and caption.',
    storeDirect: true,
    optionsSchema: {
        ui: {
            type: 'core/text',
            label: 'UI Hint',
            description:
                'Optional hint for Studio input rendering. Does not affect stored data.',
            required: false
        }
    }
});
