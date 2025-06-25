import fieldRegistry from '../../registry/FieldRegistry';

fieldRegistry.register({
    type: 'core/datetime',
    label: 'Date/Time',
    description: 'A date-time value.',
    storeDirect: true,
    fields: {
        value: {
            type: 'core/text',
            label: 'Value',
            description: 'The date-time value in ISO 8601 format (e.g., 2023-10-01T12:00:00Z).',
            options: {
                multilingual: false
            }
        }
    },
    optionsSchema: {
        format: {
            type: 'core/text',
            label: 'Date Format',
            description: 'Optional format for displaying the date (e.g., YYYY-MM-DD HH:mm:ss).'
        },
        placeholder: {
            type: 'core/text',
            label: 'Placeholder',
            description: 'Placeholder text for the date field.'
        }
    }
});
