import type { FieldSchema } from '@/types/Field';
import fieldRegistry from '@/registry/FieldRegistry';

fieldRegistry.register({
    type: 'core/select',
    label: 'Select',
    description: 'A select field.',
    fields: {
        value: {
            type: 'string',
            label: 'Value',
            description: 'The selected value from the options.',
            multilingual: true,
            required: true
        }
    },
    optionsSchema: {
        choices: {
            type: 'array',
            multilingual: true,
            required: true,
            items: {
                type: 'core/structure',
                subItems: {
                    type: 'object'
                }
            }
        },
        allowEmpty: {
            type: 'boolean',
            default: false,
            label: 'Allow Empty',
            description: 'Whether the select can be empty.'
        },
        multiple: {
            type: 'boolean',
            default: false,
            label: 'Multiple Selection',
            description: 'Allow multiple selections in the select field.'
        },
        placeholder: {
            type: 'string',
            label: 'Placeholder',
            description: 'Placeholder text for the select field.'
        }
    }
});
