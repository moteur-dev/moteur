import { BlockSchema } from '@/types/Block';
import { listBlocks } from '@/api/blocks';

export class BlockRegistry {
    private schemas: Record<string, BlockSchema>;

    constructor() {
        this.schemas = listBlocks();
    }

    get(type: string): BlockSchema | undefined {
        return this.schemas[type] || this.schemas[`core/${type}`];
    }

    has(type: string): boolean {
        return !!this.get(type);
    }

    all(): Record<string, BlockSchema> {
        return this.schemas;
    }
}
