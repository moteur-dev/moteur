/**
 * @moteur/ai — provider-agnostic AI layer for Moteur.
 * Types, adapters (OpenAI, Anthropic, Mock), credits, and getAdapter/setAdapter.
 */

export type {
    CreditBalance,
    MoteurAIContext,
    GenerateOptions,
    ImageGenerateOptions,
    ImageResult,
    MoteurAIAdapter
} from './types.js';

export { getAdapter, setAdapter } from './adapter.js';
export { getAdapterFromEnv, clearAdapterCache } from './getAdapter.js';
export { getCredits, deductCredits, setCredits } from './credits.js';
export { getCreditCost, DEFAULT_CREDIT_COSTS, resetCreditCostOverrides } from './creditCosts.js';
export { MockAdapter } from './providers/MockAdapter.js';
export { AIError, NotImplementedError } from './errors.js';
export type { AIErrorCode, AIErrorDetails } from './errors.js';
export { getImageAdapter } from './getImageAdapter.js';
export type { ProjectAISettings } from './getImageAdapter.js';
export { generateImages } from './imageGeneration.js';
export type {
    GenerationRequest,
    GenerationResult,
    GeneratedImage,
    StyleHint
} from './imageGeneration.js';
