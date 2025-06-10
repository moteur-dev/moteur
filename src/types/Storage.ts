export interface StorageAdapter {

  get(key: string): Promise<Buffer | null>;

  put(key: string, data: Buffer, options?: Record<string, any>): Promise<void>;

  delete(key: string): Promise<void>;

  list(prefix?: string): Promise<string[]>;
  
}