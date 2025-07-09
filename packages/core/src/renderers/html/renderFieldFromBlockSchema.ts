import { Block } from '@moteur/types/Block';
import { RenderOptions } from '@moteur/types/Renderer';
import { BlockRegistry } from '../../registry/BlockRegistry';
import { renderField } from './htmlFieldRenderer';

const blockRegistry = new BlockRegistry();

export function renderFieldFromBlockSchema(
    block: Block,
    fieldName: string,
    options: RenderOptions
): string {
    if (!block || !block.type) {
        throw new Error('Invalid block or block type provided.');
    }

    const blockType = block.type;
    const schema = blockRegistry.get(blockType);

    if (!schema) {
        throw new Error(`Schema for block type "${blockType}" is not defined.`);
    }

    if (!schema.fields?.[fieldName]) {
        return '';
    }

    const fieldSchema = schema.fields[fieldName];
    const fieldType = fieldSchema.type;
    const value = block.data?.[fieldName];

    return renderField(fieldType, value, options, fieldSchema);
}
