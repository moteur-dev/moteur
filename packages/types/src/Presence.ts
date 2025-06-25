export interface Presence {
    userId: string;
    name: string;
    avatarUrl?: string;

    // Scope
    projectId: string;
    screenId?: string;

    // Detail
    entryId?: string;
    fieldPath?: string;
    typing?: boolean;
    textPreview?: string;
    cursor?: { x: number; y: number };

    // Metadata
    updatedAt: number;
}

export interface PresenceUpdate {
    screenId?: string;
    entryId?: string;
    fieldPath?: string;
    typing?: boolean;
    textPreview?: string;
    cursor?: {
        x: number; // percentage [0–100]
        y: number;
    };
}
