/**
 * AnthropicAdapter — implements MoteurAIAdapter using Anthropic Messages API.
 * Uses claude-sonnet-4-5. analyseImage uses vision; generateImage throws.
 */

import type {
    MoteurAIAdapter,
    GenerateOptions,
    ImageGenerateOptions,
    ImageResult
} from '../types.js';
import { NotImplementedError } from '../errors.js';

const DEFAULT_MODEL = 'claude-sonnet-4-20250514';

export async function createAnthropicAdapter(apiKey: string): Promise<MoteurAIAdapter> {
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic({ apiKey });

    return {
        async generate(prompt: string, options?: GenerateOptions): Promise<string> {
            const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
                { role: 'user', content: prompt }
            ];
            const res = await client.messages.create({
                model: DEFAULT_MODEL,
                max_tokens: options?.maxTokens ?? 2048,
                temperature: options?.temperature ?? 0.3,
                system: options?.system,
                messages
            });
            const block = res.content.find((b: any) => b.type === 'text');
            if (!block || typeof (block as any).text !== 'string') {
                throw new Error('Empty response from Anthropic');
            }
            return (block as any).text.trim();
        },

        async generateStructured<T>(
            prompt: string,
            _schema: object,
            options?: GenerateOptions
        ): Promise<T> {
            const system =
                (options?.system ?? '') +
                '\n\nRespond with valid JSON only. No markdown, no explanation.';
            const res = await client.messages.create({
                model: DEFAULT_MODEL,
                max_tokens: options?.maxTokens ?? 2048,
                temperature: options?.temperature ?? 0.2,
                system,
                messages: [{ role: 'user', content: prompt }]
            });
            const block = res.content.find((b: any) => b.type === 'text');
            if (!block || typeof (block as any).text !== 'string') {
                throw new Error('Empty response from Anthropic');
            }
            const text = (block as any).text.trim();
            const cleaned = text
                .replace(/^```json\s*/i, '')
                .replace(/\s*```$/i, '')
                .trim();
            return JSON.parse(cleaned) as T;
        },

        async embed(_text: string): Promise<number[]> {
            throw new Error(
                'AnthropicAdapter does not support embed(); use OpenAI for embeddings.'
            );
        },

        async analyseImage(
            imageUrl: string,
            prompt: string,
            options?: GenerateOptions
        ): Promise<string> {
            const imageBlock:
                | { type: 'image'; source: { type: 'base64'; media_type: string; data: string } }
                | { type: 'image'; source: { type: 'url'; url: string } } = imageUrl.startsWith(
                'data:'
            )
                ? {
                      type: 'image',
                      source: {
                          type: 'base64',
                          media_type: imageUrl.includes('png') ? 'image/png' : 'image/jpeg',
                          data: imageUrl.replace(/^data:image\/\w+;base64,/, '')
                      }
                  }
                : { type: 'image', source: { type: 'url', url: imageUrl } as any };

            const res = await client.messages.create({
                model: DEFAULT_MODEL,
                max_tokens: options?.maxTokens ?? 1024,
                temperature: options?.temperature ?? 0.2,
                system: options?.system,
                messages: [
                    {
                        role: 'user',
                        content: [imageBlock, { type: 'text', text: prompt }]
                    } as any
                ]
            });
            const block = res.content.find((b: any) => b.type === 'text');
            if (!block || typeof (block as any).text !== 'string') {
                throw new Error('Empty response from Anthropic');
            }
            return (block as any).text.trim();
        },

        async generateImage(
            _prompt: string,
            _options?: ImageGenerateOptions
        ): Promise<ImageResult[]> {
            throw new NotImplementedError(
                'Anthropic does not support image generation; use OpenAI or another provider.'
            );
        }
    };
}
