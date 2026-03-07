import crypto from 'crypto';
import type { VideoProvider, VideoProviderUploadResult } from '../VideoProvider.js';
import type { VideoProviderStatus } from '@moteur/types/Asset.js';

function getVimeoClient(accessToken: string): any {
    try {
        const Vimeo = require('@vimeo/vimeo').Vimeo;
        return new Vimeo.Client({ accessToken });
    } catch {
        throw new Error(
            '[moteur] Vimeo provider requires @vimeo/vimeo — run: npm install @vimeo/vimeo'
        );
    }
}

export interface VimeoProviderConfig {
    accessToken: string;
    webhookSecret: string;
}

export class VimeoProvider implements VideoProvider {
    id = 'vimeo' as const;
    label = 'Vimeo';
    private client: any;
    private webhookSecret: string;

    constructor(config: VimeoProviderConfig) {
        this.client = getVimeoClient(config.accessToken);
        this.webhookSecret = config.webhookSecret;
    }

    async upload(
        buffer: Buffer,
        _filename: string,
        _mimeType: string,
        _options?: { passthrough?: string }
    ): Promise<VideoProviderUploadResult> {
        const lib = this.client;
        return new Promise((resolve, reject) => {
            lib.request(
                {
                    method: 'POST',
                    path: '/me/videos',
                    query: { type: 'streaming' },
                    body: {}
                },
                (err: any, body: any, _status: number) => {
                    if (err) return reject(err);
                    const uploadLink = body?.upload?.upload_link;
                    const uri = body?.uri;
                    const videoId = uri?.replace('/videos/', '');
                    if (!uploadLink || !videoId)
                        return reject(new Error('Vimeo upload link missing'));
                    const req = require('https').request(
                        uploadLink,
                        {
                            method: 'PATCH',
                            headers: {
                                'Tus-Resumable': '1.0.0',
                                'Upload-Offset': '0',
                                'Content-Type': 'application/offset+octet-stream',
                                'Content-Length': String(buffer.length)
                            }
                        },
                        (res: any) => {
                            if (res.statusCode >= 200 && res.statusCode < 300) {
                                resolve({
                                    providerId: videoId,
                                    providerStatus: 'processing',
                                    providerMetadata: {
                                        embedUrl: `https://player.vimeo.com/video/${videoId}`
                                    },
                                    duration: undefined
                                });
                            } else {
                                reject(new Error(`Vimeo upload failed: ${res.statusCode}`));
                            }
                        }
                    );
                    req.on('error', reject);
                    req.write(buffer);
                    req.end();
                }
            );
        });
    }

    verifySignature(rawBody: string, signature: string, secret: string): boolean {
        const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
        const sig = signature.startsWith('vimeo=') ? signature.slice(6) : signature;
        return sig === expected;
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
        correlationId?: string;
    } | null> {
        const body = typeof payload === 'string' ? payload : JSON.stringify(payload);
        const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
        if (signature !== expected && signature !== `vimeo=${expected}`)
            return Promise.resolve(null);

        const data = (payload as any)?.data ?? (payload as any);
        const type = (payload as any)?.type ?? (payload as any)?.action;
        const videoUri = data?.uri ?? data?.resource_uri;
        const videoId = videoUri?.replace?.('/videos/', '') ?? data?.id;

        if (
            videoId &&
            (type === 'video.available' ||
                type === 'transcode.complete' ||
                type === 'video.transcode.complete')
        ) {
            const embedUrl = `https://player.vimeo.com/video/${videoId}`;
            const thumbnailUrl = data?.pictures?.sizes?.[0]?.link;
            const passthrough = data?.passthrough;
            return Promise.resolve({
                providerId: videoId,
                providerStatus: 'ready',
                providerMetadata: { streamUrl: embedUrl, embedUrl, thumbnailUrl },
                duration: data?.duration != null ? parseFloat(data.duration) : undefined,
                ...(passthrough && { correlationId: passthrough })
            });
        }
        if (videoId && (type === 'video.transcode.failed' || type === 'video.upload.failed')) {
            return Promise.resolve({
                providerId: videoId,
                providerStatus: 'error',
                providerMetadata: { error: (data as any).error ?? 'Transcode or upload failed' }
            });
        }
        return Promise.resolve(null);
    }

    async delete(providerId: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.client.request({ method: 'DELETE', path: `/videos/${providerId}` }, (err: any) =>
                err ? reject(err) : resolve()
            );
        });
    }
}
