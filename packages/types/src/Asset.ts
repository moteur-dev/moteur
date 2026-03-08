export type AssetType = 'image' | 'video' | 'document';
export type AssetStatus = 'processing' | 'ready' | 'error';
export type VideoProviderStatus = 'uploading' | 'processing' | 'ready' | 'error';
export type VideoProviderId = 'mux' | 'vimeo';

export type FocalPoint = {
    x: number; // 0.0–1.0, proportion from left
    y: number; // 0.0–1.0, proportion from top
};

export type ImageVariant = {
    key: string;
    url: string;
    width: number;
    height: number;
    size: number;
    format: string;
    generatedAt: string;
};

export type Asset = {
    id: string;
    projectId: string;
    filename: string;
    mimeType: string;
    size: number;
    type: AssetType;
    status: AssetStatus;
    adapter: string; // 'local' | 's3' | 'r2'

    // ── Asset-level metadata ──
    title?: string;
    alt?: string;
    caption?: string;
    description?: string;
    credit?: string;

    // ── Image-only ──
    width?: number;
    height?: number;
    focalPoint?: FocalPoint;
    variants?: ImageVariant[];

    // ── Video-only ──
    duration?: number; // seconds; null if ffprobe unavailable
    provider?: VideoProviderId;
    providerId?: string;
    providerStatus?: VideoProviderStatus;
    providerMetadata?: {
        streamUrl?: string;
        thumbnailUrl?: string;
        playbackId?: string;
        embedUrl?: string;
        [key: string]: any;
    };
    keepLocalCopy?: boolean;

    // ── Storage (local copy or non-video assets) ──
    path?: string;
    localUrl?: string;

    // ── Computed (set at read time via resolveAssetUrl) ──
    url: string;

    // ── Organisation ──
    folder?: string;

    // ── Authorship ──
    uploadedBy: string;
    uploadedByName: string;

    createdAt: string;
    updatedAt: string;
};
