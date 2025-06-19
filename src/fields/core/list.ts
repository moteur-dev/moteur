import type { FieldSchema } from '@/types/Field';
import fieldRegistry from '@/registry/FieldRegistry';

fieldRegistry.register({
    type: 'core/list',
    label: 'List',
    description: 'A repeatable list of values or structured objects.',
    fields: {
        items: {
            type: 'core/object',
            label: 'Item Schema',
            description: 'Schema definition for each individual item in the list.',
            required: true,
            storeDirect: true
        }
    },
    optionsSchema: {
        allowEmpty: {
            type: 'core/boolean',
            default: false,
            label: 'Allow Empty',
            description: 'Whether the list can be empty.'
        },
        minItems: {
            type: 'core/number',
            label: 'Minimum Items',
            default: 0
        },
        maxItems: {
            type: 'core/number',
            label: 'Maximum Items'
        },
        sortable: {
            type: 'core/boolean',
            default: true,
            label: 'Sortable',
            description: 'Allow manual reordering of list items.'
        },
        uniqueItems: {
            type: 'core/boolean',
            default: false,
            label: 'Unique Items',
            description: 'Whether items in the list must be unique.'
        }
    }
});
