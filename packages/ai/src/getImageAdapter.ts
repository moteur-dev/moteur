/**
 * Returns the image generation adapter for a project.
 * Separate from getAdapter() because the project may use a different provider
 * for image generation (e.g. OpenAI for text, OpenAI for images; or fal for images only).
 */

import type { MoteurAIAdapter } from './types.js';
import { AIError } from './errors.js';
import { createOpenAIAdapter } from './providers/OpenAIAdapter.js';
import { createFalAdapter } from './providers/FalAdapter.js';
import { createReplicateAdapter } from './providers/ReplicateAdapter.js';

export interface ProjectAISettings {
    imageProvider?: 'openai' | 'fal' | 'replicate' | null;
}

const OPENAI_API_KEY =
    process.env.MOTEUR_AI_API_KEY ?? process.env.OPENAI_API_KEY;

/**
 * Returns an adapter that supports generateImage for the given project settings.
 * @throws AIError('image_provider_not_configured') when imageProvider is null/undefined or not supported
 */
export async function getImageAdapter(
    projectSettings: ProjectAISettings
): Promise<MoteurAIAdapter> {
    const provider = projectSettings?.imageProvider ?? null;
    if (provider == null || provider === '') {
        throw new AIError('image_provider_not_configured');
    }

    if (provider === 'openai') {
        if (!OPENAI_API_KEY) {
            throw new AIError('image_provider_not_configured');
        }
        return createOpenAIAdapter(OPENAI_API_KEY);
    }

    if (provider === 'fal') {
        return createFalAdapter();
    }

    if (provider === 'replicate') {
        return createReplicateAdapter();
    }

    throw new AIError('image_provider_not_configured');
}
