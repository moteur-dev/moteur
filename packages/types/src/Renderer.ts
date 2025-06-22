import { Block } from './Block';

export interface RenderOptions {
    locale: string;
    context?: Record<string, any>;
    format?: 'html' | 'react' | 'vue' | 'astro';
}

export interface BlockRenderer {
    renderBlock(block: Block, options: RenderOptions): string;
    renderLayout(layout: Block[], options: RenderOptions): string;
}
