import { renderLinkField } from '../../../../src/renderers/html/fields/core/renderLinkField';

describe('renderLinkField', () => {
    const baseField = {
        type: 'core/link',
        label: 'Link'
    };

    const options = { locale: 'en' };

    it('renders a basic link with label and URL', () => {
        const value = {
            url: '/docs',
            label: { en: 'Documentation' },
            rel: ['nofollow'],
            target: '_blank'
        };

        const output = renderLinkField(value, options, baseField);
        expect(output).toContain('<a href="/docs"');
        expect(output).toContain('Documentation');
        expect(output).toContain('rel="nofollow"');
        expect(output).toContain('target="_blank"');
    });

    it('renders fallback label if translation missing', () => {
        const value = {
            url: '/fallback',
            label: { fr: 'Fallback' }
        };

        const output = renderLinkField(value, options, baseField);
        expect(output).toMatch(/>\s*\/fallback\s*<\/a>/); // fallback to URL
    });

    it('skips rendering if URL is missing', () => {
        const output = renderLinkField({}, options, baseField);
        expect(output).toBe('');
    });

    it('returns empty string if no label or url is present', () => {
        const output = renderLinkField({}, options, baseField);
        expect(output).toBe('');
    });

    it('adds aria-label when provided', () => {
        const output = renderLinkField(
            {
                url: '/home',
                label: { en: 'Home' },
                ariaLabel: { en: 'Homepage' }
            },
            options,
            baseField
        );

        expect(output).toContain('aria-label="Homepage"');
    });

    it('renders style class and icon if meta is provided', () => {
        const output = renderLinkField(
            {
                url: '/start',
                label: { en: 'Start' },
                meta: {
                    style: 'primary',
                    icon: '🔥',
                    isButton: true
                }
            },
            options,
            baseField
        );

        expect(output).toContain('class="link link--primary"');
        expect(output).toContain('🔥');
    });

    it('renders rel attribute from array', () => {
        const output = renderLinkField(
            {
                url: '/x',
                label: { en: 'X' },
                rel: ['noopener', 'noreferrer']
            },
            options,
            baseField
        );

        expect(output).toContain('rel="noopener noreferrer"');
    });
});
