export interface Audit {
    createdAt?: string; // ISO date string for creation time
    updatedAt?: string; // ISO date string for last update time
    createdBy?: string; // User ID or name of the creator
    updatedBy?: string; // User ID or name of the last updater
    revision?: number; // Revision number for version control
}
