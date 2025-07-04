import fieldRegistry from '../../registry/FieldRegistry';

fieldRegistry.register({
    type: 'core/structure',
    label: 'Structure',
    description: 'A reusable structured field defined by a shared schema.',
    fields: {
        value: {
            type: 'core/object',
            label: 'Structured Data',
            description: 'Content validated and rendered according to the referenced schema.',
            required: true
        }
    },
    optionsSchema: {
        structure: {
            type: 'core/text',
            label: 'Structure ID',
            description: "The ID of the shared structure schema (e.g., 'myApp/teamMember')."
        },
        inlineSchema: {
            type: 'core/object',
            label: 'Schema (inline)',
            description:
                'The schema definition for this structure, which defines the fields and their types.'
        }
    }
});
