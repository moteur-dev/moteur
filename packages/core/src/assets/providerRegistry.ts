import type { VideoProviderId } from '@moteur/types/Asset.js';
import type { VideoProvider } from './VideoProvider.js';
import type { VideoProvidersConfig } from '@moteur/types/Project.js';

const providers = new Map<VideoProviderId, VideoProvider>();

let instanceConfig: VideoProvidersConfig | null = null;

export function registerProvider(provider: VideoProvider): void {
    providers.set(provider.id, provider);
}

export function getProvider(id: VideoProviderId): VideoProvider | null {
    return providers.get(id) ?? null;
}

export function setVideoProvidersConfig(config: VideoProvidersConfig | null): void {
    instanceConfig = config;
    if (!config) return;
    if (config.mux) {
        try {
            const { MuxProvider } = require('./providers/MuxProvider.js');
            registerProvider(new MuxProvider(config.mux));
        } catch {
            // optional dep not installed
        }
    }
    if (config.vimeo) {
        try {
            const { VimeoProvider } = require('./providers/VimeoProvider.js');
            registerProvider(new VimeoProvider(config.vimeo));
        } catch {
            // optional dep not installed
        }
    }
}

export function getVideoProvidersConfig(): VideoProvidersConfig | null {
    return instanceConfig;
}

export function getActiveProvider(): VideoProvider | null {
    const id = instanceConfig?.active;
    if (!id) return null;
    return getProvider(id);
}
