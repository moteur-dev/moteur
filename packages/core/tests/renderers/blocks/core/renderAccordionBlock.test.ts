import { describe, it, expect } from 'vitest';
import { renderAccordionBlock } from '../../../../src/renderers/html/blocks/core/renderAccordionBlock';
import { Block } from '@moteur/types/Block.js';

const opts = { locale: 'en' };

describe('renderAccordionBlock', () => {
    it('renders with multiple subItems', () => {
        const block: Block = {
            type: 'core/accordion',
            data: {
                title: { en: 'FAQ' },
                subItems: [
                    { title: { en: 'Q1' }, content: { en: '<p>A1</p>' } },
                    { title: { en: 'Q2' }, content: { en: '<p>A2</p>' } }
                ],
                multiOpen: true
            }
        };
        const html = renderAccordionBlock(block, opts);
        expect(html).toContain('<details');
        expect(html).toContain('accordion__item');
        expect(html).toContain('<h2 class="accordion__heading"');
    });

    it('renders gracefully with empty subItems', () => {
        const block: Block = { type: 'core/accordion', data: { subItems: [] } };
        const html = renderAccordionBlock(block, opts);
        expect(html).toContain('No content available');
    });
});
