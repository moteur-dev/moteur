import { StorageAdapter } from '@moteur/types/Storage';

type AdapterFactory = new (options: any) => StorageAdapter;

export class StorageRegistry {
    private adapters: Record<string, AdapterFactory> = {};

    register(id: string, adapterClass: AdapterFactory): void {
        this.adapters[id] = adapterClass;
    }

    get(id: string): AdapterFactory {
        const adapterClass = this.adapters[id] || this.adapters[`core/${id}`];
        if (!adapterClass) {
            throw new Error(`Storage adapter "${id}" not found in registry.`);
        }
        return adapterClass;
    }

    has(id: string): boolean {
        return !!this.adapters[id] || !!this.adapters[`core/${id}`];
    }

    list(): string[] {
        return Object.keys(this.adapters);
    }

    all(): Record<string, AdapterFactory> {
        return this.adapters;
    }

    create(id: string, options: any): StorageAdapter {
        const AdapterClass = this.get(id);
        return new AdapterClass(options);
    }
}

// Singleton instance
export const storageRegistry = new StorageRegistry();
