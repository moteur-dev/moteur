import { Field } from './Field';

export interface TemplateSchema {
    id: string;
    label: string;
    description?: string;
    fields: Record<string, Field>;
    options?: Record<string, any>;
}

// types/Page.ts
export interface Page {
    id: string;
    type: string; // references TemplateSchema.id
    data: Record<string, any>;
}
export const templateSchemaFields: Record<string, Field> = {
    id: {
        type: 'core/text',
        label: 'ID',
        options: { multilingual: false, required: true }
    },
    label: {
        type: 'core/text',
        label: 'Label',
        options: { multilingual: true, required: true }
    },
    description: {
        type: 'core/text',
        label: 'Description',
        options: { multilingual: true, required: false }
    }
};
