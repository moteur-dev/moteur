import fieldRegistry from '../../registry/FieldRegistry.js';

fieldRegistry.register({
    type: 'core/categories',
    label: 'Categories',
    description: 'A list of category IDs, referencing a structured category model.',
    storeDirect: true,
    multilingual: false,
    fields: {
        items: {
            type: 'core/text',
            label: 'Category ID',
            description: 'Each entry is a category ID referring to the category model.'
        }
    },
    optionsSchema: {
        multiple: {
            type: 'core/boolean',
            label: 'Allow Multiple Categories',
            default: true
        },
        source: {
            type: 'core/text',
            label: 'Category Model Source',
            description: 'Reference to where categories are defined, like "project/categories".',
            required: true
        }
    }
});
