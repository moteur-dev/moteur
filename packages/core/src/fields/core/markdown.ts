import fieldRegistry from '../../registry/FieldRegistry';

fieldRegistry.register({
    type: 'core/markdown',
    label: 'Markdown',
    description: 'A markdown-based long text field with multilingual support.',
    fields: {
        markdown: {
            type: 'core/text',
            label: 'Markdown Content',
            description: 'Supports GitHub-flavored markdown syntax.',
            multilingual: true
        }
    },
    optionsSchema: {
        allowHTML: {
            type: 'core/boolean',
            default: false,
            description: 'Allow raw HTML inside the markdown field.'
        },
        placeholder: {
            type: 'core/text',
            label: 'Placeholder',
            description: 'Placeholder text for the markdown editor.'
        }
    }
});
