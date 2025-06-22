import { renderQuoteBlock } from '../../../../renderers/html/blocks/core/renderQuoteBlock';
import { Block } from '@mote@mote@moteur/types/Block.js';

const opts = { locale: 'en' };

describe('renderQuoteBlock', () => {
    it('renders quote with author and image', () => {
        const block: Block = {
            type: 'core/quote',
            data: {
                text: { en: 'To be or not to be.' },
                author: { en: 'Shakespeare' },
                authorImage: { src: '/shakespeare.jpg', alt: { en: 'William' } }
            }
        };
        const html = renderQuoteBlock(block, opts);
        expect(html).toContain('<blockquote');
        expect(html).toContain('To be or not to be');
        expect(html).toContain('Shakespeare');
        expect(html).toContain('quote__author-image');
    });

    it('renders quote without author gracefully', () => {
        const block: Block = {
            type: 'core/quote',
            data: { text: { en: 'Wisdom is knowing nothing.' } }
        };
        const html = renderQuoteBlock(block, opts);
        expect(html).toContain('<blockquote');
        expect(html).not.toContain('<footer>');
    });
});
