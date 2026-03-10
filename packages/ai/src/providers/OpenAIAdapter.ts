/**
 * OpenAIAdapter — implements MoteurAIAdapter using OpenAI API.
 * Uses gpt-4o for text, text-embedding-3-small for embed, dall-e-3 for generateImage.
 */

import type {
    MoteurAIAdapter,
    GenerateOptions,
    ImageGenerateOptions,
    ImageResult,
} from '../types.js';

export async function createOpenAIAdapter(apiKey: string): Promise<MoteurAIAdapter> {
    const { OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey });

    return {
        async generate(prompt: string, options?: GenerateOptions): Promise<string> {
            const completion = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    ...(options?.system
                        ? [{ role: 'system' as const, content: options.system }]
                        : []),
                    { role: 'user', content: prompt },
                ],
                max_tokens: options?.maxTokens ?? 2048,
                temperature: options?.temperature ?? 0.3,
            });
            const content = completion.choices[0]?.message?.content;
            if (content == null) throw new Error('Empty response from OpenAI');
            return content.trim();
        },

        async generateStructured<T>(
            prompt: string,
            schema: object,
            options?: GenerateOptions
        ): Promise<T> {
            const completion = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    ...(options?.system
                        ? [{ role: 'system' as const, content: options.system }]
                        : []),
                    { role: 'user', content: prompt },
                ],
                response_format: { type: 'json_object' },
                max_tokens: options?.maxTokens ?? 2048,
                temperature: options?.temperature ?? 0.2,
            });
            const content = completion.choices[0]?.message?.content;
            if (content == null) throw new Error('Empty response from OpenAI');
            return JSON.parse(content) as T;
        },

        async embed(text: string): Promise<number[]> {
            const res = await openai.embeddings.create({
                model: 'text-embedding-3-small',
                input: text.slice(0, 8191),
            });
            const embedding = res.data[0]?.embedding;
            if (!embedding) throw new Error('Empty embedding from OpenAI');
            return embedding;
        },

        async analyseImage(
            imageUrl: string,
            prompt: string,
            options?: GenerateOptions
        ): Promise<string> {
            const isBase64 = imageUrl.startsWith('data:');
            const content: Array<{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }> = [
                { type: 'image_url', image_url: { url: imageUrl } },
                { type: 'text', text: prompt },
            ];
            const completion = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    ...(options?.system
                        ? [{ role: 'system' as const, content: options.system }]
                        : []),
                    { role: 'user', content } as any,
                ],
                max_tokens: options?.maxTokens ?? 1024,
                temperature: options?.temperature ?? 0.2,
            });
            const text = completion.choices[0]?.message?.content;
            if (text == null) throw new Error('Empty response from OpenAI');
            return text.trim();
        },

        async generateImage(
            prompt: string,
            options?: ImageGenerateOptions
        ): Promise<ImageResult[]> {
            const count = Math.min(2, Math.max(1, options?.count ?? 1));
            const sizeMap = {
                '1:1': '1024x1024',
                '4:3': '1792x1024',
                '16:9': '1792x1024',
                '3:2': '1024x1792',
            } as const;
            const size = options?.aspectRatio ? sizeMap[options.aspectRatio] : '1024x1024';
            const results: ImageResult[] = [];
            for (let i = 0; i < count; i++) {
                const response = await openai.images.generate({
                    model: 'dall-e-3',
                    prompt,
                    n: 1,
                    size: size as '1024x1024' | '1792x1024' | '1024x1792',
                });
                const img = response.data?.[0];
                if (img?.url) {
                    results.push({
                        url: img.url,
                        width: size === '1024x1024' ? 1024 : 1792,
                        height: size === '1024x1792' ? 1792 : 1024,
                        prompt,
                    });
                }
            }
            return results;
        },
    };
}
