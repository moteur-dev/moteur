import { BlockRenderer, RenderOptions } from '../../types/Renderer';
import { Block } from '../../types/Block';
import { renderAccordionBlock } from './blocks/core/renderAccordionBlock';
import { renderHeroBlock } from './blocks/core/renderHeroBlock';
import { renderQuoteBlock } from './blocks/core/renderQuoteBlock';
import { renderSpacerBlock } from './blocks/core/renderSpacerBlock';
import { renderFallbackBlock } from './renderFallbackBlock';

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
