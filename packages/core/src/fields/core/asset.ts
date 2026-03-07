import fieldRegistry from '../../registry/FieldRegistry.js';

fieldRegistry.register({
    type: 'core/asset',
    label: 'Asset',
    description:
        'Reference to a project asset (image, video, or document) with optional usage-level alt and caption.',
    storeDirect: true,
    options: {}
});
