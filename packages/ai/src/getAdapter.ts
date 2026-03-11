/**
 * Adapter factory — reads MOTEUR_AI_PROVIDER from env, returns the correct adapter.
 * Throws if env is missing or unrecognised.
 *
 * Env:
 *   MOTEUR_AI_PROVIDER = 'anthropic' | 'openai' | 'mock'
 *   MOTEUR_AI_API_KEY = API key (used for the selected provider)
 *   Or: ANTHROPIC_API_KEY / OPENAI_API_KEY for provider-specific keys
 */

import type { MoteurAIAdapter } from './types.js';
import { createOpenAIAdapter } from './providers/OpenAIAdapter.js';
import { MockAdapter } from './providers/MockAdapter.js';

let cachedAdapter: MoteurAIAdapter | null = null;

export async function getAdapterFromEnv(): Promise<MoteurAIAdapter> {
    if (cachedAdapter) return cachedAdapter;

    const provider = (process.env.MOTEUR_AI_PROVIDER ?? '').toLowerCase();
    const apiKey =
        process.env.MOTEUR_AI_API_KEY ??
        (provider === 'anthropic' ? process.env.ANTHROPIC_API_KEY : null) ??
        (provider === 'openai' ? process.env.OPENAI_API_KEY : null);

    if (provider === 'mock') {
        cachedAdapter = new MockAdapter();
        return cachedAdapter;
    }

    if (provider === 'openai') {
        if (!apiKey) {
            throw new Error(
                'MOTEUR_AI_PROVIDER is "openai" but neither MOTEUR_AI_API_KEY nor OPENAI_API_KEY is set.'
            );
        }
        cachedAdapter = await createOpenAIAdapter(apiKey);
        return cachedAdapter;
    }

    if (provider === 'anthropic') {
        if (!apiKey) {
            throw new Error(
                'MOTEUR_AI_PROVIDER is "anthropic" but neither MOTEUR_AI_API_KEY nor ANTHROPIC_API_KEY is set.'
            );
        }
        try {
            const { createAnthropicAdapter } = await import('./providers/AnthropicAdapter.js');
            cachedAdapter = await createAnthropicAdapter(apiKey);
            return cachedAdapter;
        } catch (_e) {
            throw new Error(
                'MOTEUR_AI_PROVIDER is "anthropic" but @anthropic-ai/sdk could not be loaded. Install it or use another provider.'
            );
        }
    }

    if (!provider) {
        throw new Error(
            'MOTEUR_AI_PROVIDER is not set. Set it to "anthropic", "openai", or "mock".'
        );
    }

    throw new Error(
        `Unrecognised MOTEUR_AI_PROVIDER: "${provider}". Use "anthropic", "openai", or "mock".`
    );
}

/**
 * For tests: reset the cached adapter.
 */
export function clearAdapterCache(): void {
    cachedAdapter = null;
}
