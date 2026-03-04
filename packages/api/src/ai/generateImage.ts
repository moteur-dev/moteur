// src/routes/ai/generate-image.ts
import express, { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middlewares/auth.js';

const router: Router = express.Router();

/** Lazy loader for OpenAI client */
async function getOpenAI() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return null;

    const { OpenAI } = await import('openai');
    return new OpenAI({ apiKey });
}

const schema = z.object({
    prompt: z.string().min(5),
    size: z.enum(['1024x1024', '1792x1024', '1024x1792']).default('1024x1024'),
    quality: z.string().default('hd')
});

type _PromptOptions = {
    scene: string; // e.g. "A robot arm assembling gears"
    style?: string; // e.g. "Retro-futuristic 1970s poster"
    medium?: string; // e.g. "Screenprint with halftone"
    palette?: string; // e.g. "Bold oranges and muted browns"
    quality?: string; // e.g. "High resolution, cinematic detail"
    composition?: string; // e.g. "Geometric layout, balanced framing"
    extras?: string[]; // e.g. ["No text", "Background-friendly"]
};

router.post('/generate-image', requireAuth, async (req: any, res: any) => {
    const parseResult = schema.safeParse(req.body ?? {});
    if (!parseResult.success) {
        return res.status(400).json({ error: 'Invalid or missing prompt/params' });
    }

    const { prompt, size, quality } = parseResult.data;

    // Soft dependency: return 503 if OpenAI is disabled
    const openai = await getOpenAI();
    if (!openai) {
        console.warn('[AI] OpenAI disabled: no OPENAI_API_KEY found.');
        return res.status(503).json({
            error: 'AI image generation is disabled (missing OPENAI_API_KEY)'
        });
    }

    try {
        const response = await openai.responses.create({
            model: 'gpt-4o',
            input: `Generate an image of ${prompt}. Use size: ${size}. Quality: ${quality}.`,
            tools: [{ type: 'image_generation' }]
        });

        const imageBase64 = response.output
            .filter(o => o.type === 'image_generation_call')
            .map(o => o.result)[0];

        if (!imageBase64 || typeof imageBase64 !== 'string') {
            console.error('Invalid image result:', response);
            return res.status(500).json({ error: 'Image generation failed' });
        }

        return res.json({
            image: `data:image/png;base64,${imageBase64}`,
            responseId: response.id
        });
    } catch (err: any) {
        console.error('OpenAI API error:', err);
        return res.status(500).json({ error: err.message || 'OpenAI request failed' });
    }
});

export default router;
