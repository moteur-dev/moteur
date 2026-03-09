import fieldRegistry from '../../registry/FieldRegistry.js';

fieldRegistry.register({
    type: 'core/geo',
    label: 'Geo Coordinates',
    description: 'A geographic coordinate stored as latitude and longitude.',
    fields: {
        lat: {
            type: 'core/number',
            label: 'Latitude',
            description: 'Latitude value.',
            required: true
        },
        lng: {
            type: 'core/number',
            label: 'Longitude',
            description: 'Longitude value.',
            required: true
        }
    },
    optionsSchema: {
        defaultZoom: {
            type: 'core/number',
            default: 12,
            label: 'Default Zoom',
            description: 'Default map zoom level for map UI.',
            required: false
        },
        ui: {
            type: 'core/text',
            label: 'UI Hint',
            description:
                'Optional hint for Studio input rendering (e.g. "map", "input"). Does not affect stored data.',
            required: false
        }
    }
});
