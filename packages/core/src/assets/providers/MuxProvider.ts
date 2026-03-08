import crypto from 'crypto';
import type { VideoProvider, VideoProviderUploadResult } from '../VideoProvider.js';
import type { VideoProviderStatus } from '@moteur/types/Asset.js';

function getMuxClient(config: { tokenId: string; tokenSecret: string }): any {
    try {
        const Mux = require('@mux/mux-node');
        return new Mux({ tokenId: config.tokenId, tokenSecret: config.tokenSecret });
    } catch {
        throw new Error(
            '[moteur] Mux provider requires @mux/mux-node — run: npm install @mux/mux-node'
        );
    }
}

export interface MuxProviderConfig {
    tokenId: string;
    tokenSecret: string;
    webhookSecret: string;
}

export class MuxProvider implements VideoProvider {
    id = 'mux' as const;
    label = 'Mux';
    private client: any;
    private webhookSecret: string;

    constructor(config: MuxProviderConfig) {
        this.client = getMuxClient(config);
        this.webhookSecret = config.webhookSecret;
    }

    async upload(
        buffer: Buffer,
        filename: string,
        mimeType: string,
        options?: { passthrough?: string }
    ): Promise<VideoProviderUploadResult> {
        const mux = this.client;
        const newAssetSettings: Record<string, any> = {
            playback_policy: ['public'],
            video_quality: 'basic'
        };
        if (options?.passthrough) newAssetSettings.passthrough = options.passthrough;
        const upload = await mux.video.uploads.create({
            cors_origin: '*',
            new_asset_settings: newAssetSettings
        });
        const uploadUrl = upload.url ?? upload.data?.url;
        if (!uploadUrl) throw new Error('Mux upload URL missing');
        const uploadId = upload.id ?? upload.data?.id;
        if (!uploadId) throw new Error('Mux upload ID missing');

        const res = await fetch(uploadUrl, {
            method: 'PUT',
            body: buffer,
            headers: {
                'Content-Type': mimeType,
                'Content-Length': String(buffer.length)
            }
        });
        if (!res.ok) {
            throw new Error(`Mux upload failed: ${res.status} ${await res.text()}`);
        }

        return {
            providerId: uploadId,
            providerStatus: 'processing',
            providerMetadata: {},
            duration: undefined
        };
    }

    verifySignature(rawBody: string, signature: string, secret: string): boolean {
        const parts = signature.split(',');
        let t: string | null = null;
        let v1: string | null = null;
        for (const p of parts) {
            const [k, v] = p.trim().split('=');
            if (k === 't') t = v ?? null;
            if (k === 'v1') v1 = v ?? null;
        }
        if (!t || !v1) return false;
        const signed = `${t}.${rawBody}`;
        const expected = crypto.createHmac('sha256', secret).update(signed).digest('hex');
        return expected === v1;
    }

    handleWebhook(
        payload: unknown,
        signature: string,
        secret: string
    ): Promise<{
        providerId: string;
        providerStatus: VideoProviderStatus;
        providerMetadata: Record<string, any>;
        duration?: number;
    } | null> {
        const body = typeof payload === 'string' ? payload : JSON.stringify(payload);
        const parts = signature.split(',');
        let t: string | null = null;
        let v1: string | null = null;
        for (const p of parts) {
            const [k, v] = p.trim().split('=');
            if (k === 't') t = v ?? null;
            if (k === 'v1') v1 = v ?? null;
        }
        if (!t || !v1) return Promise.resolve(null);
        const signed = `${t}.${body}`;
        const expected = crypto.createHmac('sha256', secret).update(signed).digest('hex');
        if (expected !== v1) return Promise.resolve(null);

        const data =
            typeof payload === 'object' && payload !== null && 'data' in payload
                ? (payload as { data: any }).data
                : (payload as any)?.data;
        const type = (payload as any)?.type;
        if (type === 'video.asset.ready' && data?.id) {
            const playbackId = data.playback_ids?.[0]?.id ?? data.playback_id;
            const streamUrl = playbackId ? `https://stream.mux.com/${playbackId}.m3u8` : undefined;
            const passthrough = data.passthrough;
            return Promise.resolve({
                providerId: data.id,
                providerStatus: 'ready',
                providerMetadata: {
                    streamUrl,
                    playbackId: playbackId ?? undefined,
                    thumbnailUrl: data.thumbnail?.url
                },
                duration: data.duration != null ? parseFloat(data.duration) : undefined,
                ...(passthrough && { correlationId: passthrough })
            });
        }
        if (type === 'video.asset.errored' && data?.id) {
            return Promise.resolve({
                providerId: data.id,
                providerStatus: 'error',
                providerMetadata: { error: (data as any).errors?.message ?? 'Asset errored' }
            });
        }
        return Promise.resolve(null);
    }

    async delete(providerId: string): Promise<void> {
        await this.client.video.assets.delete(providerId);
    }
}
