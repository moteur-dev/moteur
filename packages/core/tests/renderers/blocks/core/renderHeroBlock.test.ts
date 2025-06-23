import { describe, it, expect } from 'vitest';
import { renderHeroBlock } from '../../../../src/renderers/html/blocks/core/renderHeroBlock';
import { Block } from '@moteur/types/Block.js';

const opts = { locale: 'en' };

describe('renderHeroBlock', () => {
    it('renders a basic hero with title and subtitle', () => {
        const block: Block = {
            type: 'core/hero',
            data: {
                title: { en: 'Hello' },
                subtitle: { en: 'World' },
                backgroundColor: '#000000'
            }
        };

        const html = renderHeroBlock(block, opts);
        expect(html).toContain('<h1');
        expect(html).toContain('class="hero__title"');
        expect(html).toContain('Hello');
        expect(html).toContain('<div class="hero__subtitle">World</div>');
        expect(html).toContain('background-color: #000000');
    });

    it('renders CTA using field renderer', () => {
        const block: Block = {
            type: 'core/hero',
            data: {
                title: { en: 'Test' },
                cta: {
                    url: '/start',
                    label: { en: 'Go' },
                    ariaLabel: { en: 'Go now' },
                    meta: {
                        style: 'primary',
                        icon: '🚀'
                    }
                }
            }
        };

        const html = renderHeroBlock(block, opts);
        expect(html).toContain('<a href="/start"');
        expect(html).toContain('Go');
        expect(html).toContain('🚀');
    });

    it('renders block meta attributes and custom class', () => {
        const block: Block = {
            type: 'core/hero',
            data: {
                title: { en: 'Styled' }
            },
            meta: {
                id: 'hero-1',
                customClass: 'custom-hero',
                attributes: { 'data-test': 'hero' }
            }
        };

        const html = renderHeroBlock(block, opts);
        expect(html).toContain('id="hero-1"');
        expect(html).toContain('class="hero hero--center custom-hero"');
        expect(html).toContain('data-test="hero"');
    });

    it('uses default values for headingLevel and alignment', () => {
        const block: Block = {
            type: 'core/hero',
            data: {
                title: { en: 'Defaults' }
            }
        };

        const html = renderHeroBlock(block, opts);
        expect(html).toContain('<h1');
        expect(html).toContain('class="hero__title"');
        expect(html).toContain('Defaults');
        expect(html).toContain('class="hero hero--center');
    });

    it('renders full hero block with CTA and meta', () => {
        const block: Block = {
            type: 'core/hero',
            data: {
                title: { en: 'Snapshot Title' },
                subtitle: { en: '<p>Snapshot Subtitle</p>' },
                backgroundImage: {
                    src: '/images/bg.jpg',
                    alt: { en: 'A background image' }
                },
                backgroundColor: '#123456',
                headingLevel: 'h2',
                alignment: 'left',
                cta: {
                    url: '/snapshot',
                    label: { en: 'Snapshot CTA' },
                    ariaLabel: { en: 'Read more' },
                    rel: ['noopener'],
                    target: '_blank',
                    meta: {
                        icon: '📸',
                        style: 'ghost',
                        isButton: true
                    }
                }
            },
            meta: {
                id: 'hero-snapshot',
                customClass: 'snapshot-hero',
                attributes: {
                    'data-snapshot': 'true'
                }
            }
        };

        const html = renderHeroBlock(block, { locale: 'en' });

        expect(html).toContain('<section id="hero-snapshot"');
        expect(html).toContain('class="hero hero--left snapshot-hero"');
        expect(html).toContain('background-color: #123456');
        expect(html).toContain("background-image: url('/images/bg.jpg')");

        expect(html).toContain('<h2');
        expect(html).toContain('class="hero__title"');
        expect(html).toContain('>Snapshot Title</h2>');
        expect(html).toContain('<div class="hero__subtitle"><p>Snapshot Subtitle</p></div>');

        expect(html).toContain('<a href="/snapshot"');
        expect(html).toContain('Snapshot CTA');
        expect(html).toContain('📸');
        expect(html).toContain('aria-label="Read more"');
        expect(html).toContain('rel="noopener"');
        expect(html).toContain('target="_blank"');
    });

    it('returns empty string if the block is hidden', () => {
        const block: Block = {
            type: 'core/hero',
            data: {
                title: { en: 'Hidden' }
            },
            meta: {
                hidden: true
            }
        };

        const html = renderHeroBlock(block, opts);
        expect(html).toBe('');
    });
});

it('uses h1 as default heading level', () => {
    const block: Block = {
        type: 'core/hero',
        data: { title: { en: 'Hello' } }
    };
    const html = renderHeroBlock(block, opts);
    expect(html).toContain('<h1');
});

it('respects custom heading level', () => {
    const block: Block = {
        type: 'core/hero',
        data: { title: { en: 'Hello' }, headingLevel: 'h3' }
    };
    const html = renderHeroBlock(block, opts);
    expect(html).toContain('<h3');
});

it('renders safely without subtitle or image', () => {
    const block: Block = {
        type: 'core/hero',
        data: { title: { en: 'Hello' }, backgroundColor: '#eee' }
    };
    const html = renderHeroBlock(block, opts);
    expect(html).toContain('Hello');
    expect(html).toContain('background-color: #eee');
});

it('applies meta id, class, and attributes', () => {
    const block: Block = {
        type: 'core/hero',
        data: { title: { en: 'Test' } },
        meta: {
            id: 'hero123',
            customClass: 'custom-style',
            attributes: { 'data-test': 'yes' }
        }
    };
    const html = renderHeroBlock(block, opts);
    expect(html).toContain('id="hero123"');
    expect(html).toContain('custom-style');
    expect(html).toContain('data-test="yes"');
});
