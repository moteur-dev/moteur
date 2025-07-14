import { BlockRenderer, RenderOptions } from '@moteur/types/Renderer';
import { Block } from '@moteur/types/Block';
import { renderAccordionBlock } from './blocks/core/renderAccordionBlock.js';
import { renderHeroBlock } from './blocks/core/renderHeroBlock.js';
import { renderQuoteBlock } from './blocks/core/renderQuoteBlock.js';
import { renderSpacerBlock } from './blocks/core/renderSpacerBlock.js';
import { renderFallbackBlock } from './renderFallbackBlock.js';

const blockRenderers: Record<string, (block: Block, opts: RenderOptions) => string> = {
    'core/accordion': renderAccordionBlock,
    'core/hero': renderHeroBlock,
    'core/quote': renderQuoteBlock,
    'core/spacer': renderSpacerBlock
};

export const htmlRenderer: BlockRenderer = {
    renderBlock(block: Block, opts: RenderOptions): string {
        if (block.meta?.hidden) {
            return '';
        }
        const render = blockRenderers[block.type] || renderFallbackBlock;
        return render(block, opts);
    },

    renderLayout(blocks: Block[], opts: RenderOptions): string {
        return blocks.map(block => htmlRenderer.renderBlock(block, opts)).join('\n');
    }
};
