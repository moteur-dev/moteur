import fieldRegistry from '../../registry/FieldRegistry.js';

fieldRegistry.register({
    type: 'core/asset-list',
    label: 'Asset list',
    description: 'List of project asset references with optional usage-level alt and caption.',
    storeDirect: true,
    options: {}
});
