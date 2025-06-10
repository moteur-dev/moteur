import { Field } from './Field.js';

export interface Block {
    type: string; // Block type (e.g., "core/hero")
    data: Record<string, any>; // Block content data
    conditions?: Record<string, any>; // Visibility rules for the block
    meta?: BlockMeta; // Metadata for styling and attributes
    options?: Record<string, any>; // Additional options
}

export interface BlockSchema {
    type: string; // Schema type
    label: string; // Display label
    description?: string; // Optional description
    category?: string; // Category for grouping
    fields: Record<string, Field>; // Field definitions for the block
    optionsSchema?: Record<string, any>; // Additional options
}

export interface BlockMeta {
    customClass?: string; // Custom CSS classes
    customStyle?: string | Record<string, string>; // Inline styles
    attributes?: Record<string, string>; // Extra HTML attributes
    id?: string; // Manual block ID (e.g., for anchors)
    hidden?: boolean; // Skip rendering if true
    previewHint?: string; // Optional label shown in the editor
}
