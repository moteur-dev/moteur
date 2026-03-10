import fieldRegistry from '../../registry/FieldRegistry.js';
import { validateTextField } from '../../validators/fields/core/validateTextField.js';

/**
 * Canonical name for formatted HTML content. Same implementation and stored shape as core/html.
 */
fieldRegistry.register({
    type: 'core/rich-text',
    label: 'Rich Text',
    description: 'Formatted HTML content with multilingual support. Canonical name for core/html.',
    validate: validateTextField,
    storeDirect: true,
    fields: {
        html: {
            type: 'core/text',
            label: 'HTML Content',
            description: 'The raw HTML content to be stored in this field.',
            multilingual: true,
            required: true
        }
    },
    optionsSchema: {
        maxLength: {
            type: 'core/number',
            default: 255,
            label: 'Max Length',
            description: 'Maximum length of the text field.'
        },
        minLength: {
            type: 'core/number',
            default: 1,
            label: 'Min Length',
            description: 'Minimum length of the text field.'
        },
        allowEmpty: {
            type: 'core/boolean',
            default: false,
            label: 'Allow Empty',
            description: 'Whether the field can be empty.'
        },
        allowedTags: {
            type: 'core/list',
            label: 'Allowed HTML Tags',
            description: 'Restrict HTML tags to a safe subset if needed.',
            optionsSchema: {
                allowEmpty: {
                    type: 'core/boolean',
                    default: true
                }
            }
        },
        ui: {
            type: 'core/text',
            label: 'UI Hint',
            description: 'Optional hint for Studio input rendering. Does not affect stored data.',
            required: false
        }
    }
});
