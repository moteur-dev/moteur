import fieldRegistry from '../../registry/FieldRegistry';

fieldRegistry.register({
    type: 'core/tags',
    label: 'Tags',
    description: 'A list of tag IDs, with multilingual support in the tag model.',
    storeDirect: true,
    multilingual: false,
    fields: {
        value: {
            type: 'core/list',
            label: 'Tag IDs',
            description: 'A list of tag IDs that reference the tags defined in the source model.',
            required: true,
            options: {
                itemType: 'core/text',
                allowEmpty: true,
                sortable: true
            }
        }
    },
    optionsSchema: {
        allowNew: {
            type: 'core/boolean',
            label: 'Allow New Tags',
            default: true
        },
        maxTags: {
            type: 'core/number',
            label: 'Maximum Tags',
            default: 10
        },
        separator: {
            type: 'core/text',
            label: 'Separator (optional)',
            default: ','
        },
        source: {
            type: 'core/text',
            label: 'Tag Model Source',
            description: 'Reference to where tags are defined, like "project/tags".',
            required: true
        }
    }
});
