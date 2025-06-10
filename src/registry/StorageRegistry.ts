import { StorageAdapter } from '../types/Storage.js';

export class StorageRegistry {
  private adapters: Record<string, () => StorageAdapter> = {};

  register(id: string, factory: () => StorageAdapter): void {
    this.adapters[id] = factory;
  }

  get(id: string): StorageAdapter {
    const factory = this.adapters[id];
    if (!factory) {
      throw new Error(`Storage adapter "${id}" not found in registry.`);
    }
    return factory();
  }

  has(id: string): boolean {
    return !!this.adapters[id];
  }

  all(): Record<string, () => StorageAdapter> {
    return this.adapters;
  }
}

// Singleton instance
export const storageRegistry = new StorageRegistry();
