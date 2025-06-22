import { renderSpacerBlock } from '../../../../renderers/html/blocks/core/renderSpacerBlock';
import { Block } from '@mote@mote@moteur/types/Block.js';

const opts = { locale: 'en' };

describe('renderSpacerBlock', () => {
    it('renders default spacer with 1rem', () => {
        const block: Block = { type: 'core/spacer', data: {} };
        const html = renderSpacerBlock(block, opts);
        expect(html).toContain('height: 1rem');
    });

    it('respects size and unit', () => {
        const block: Block = { type: 'core/spacer', data: { size: 24, unit: 'px' } };
        const html = renderSpacerBlock(block, opts);
        expect(html).toContain('height: 24px');
    });

    it('includes accessibility and class attributes', () => {
        const block: Block = {
            type: 'core/spacer',
            data: { size: 2 },
            meta: { customClass: 'my-spacer', attributes: { 'data-test': 'true' } }
        };
        const html = renderSpacerBlock(block, opts);
        expect(html).toContain('aria-hidden="true"');
        expect(html).toContain('my-spacer');
        expect(html).toContain('data-test="true"');
    });
});
