import { renderHtmlField } from '../../../../src/renderers/html/fields/core/renderHtmlField';
import type { Field } from '@moteur/types/Field';
import type { RenderOptions } from '@moteur/types/Renderer';

const baseOptions: RenderOptions = {
    locale: 'en'
};

describe('renderHtmlField', () => {
    it('renders sanitized HTML from localized value', () => {
        const field: Field = {
            type: 'core/html',
            label: 'HTML Field',
            options: {},
            meta: {}
        };

        const value = {
            html: {
                en: `<p>Hello <strong>world</strong></p>`
            }
        };

        const html = renderHtmlField(value, baseOptions, field);
        expect(html).toBe('<p>Hello <strong>world</strong></p>');
    });

    it('removes disallowed tags', () => {
        const field: Field = {
            type: 'core/html',
            label: 'HTML Field',
            options: {}, // default tags
            meta: {}
        };

        const value = {
            html: {
                en: `<script>alert("bad")</script><p>Safe</p>`
            }
        };

        const html = renderHtmlField(value, baseOptions, field);
        expect(html).toBe('<p>Safe</p>');
        expect(html).not.toContain('script');
    });

    it('respects custom allowedTags from field.options', () => {
        const field: Field = {
            type: 'core/html',
            label: 'HTML Field',
            options: {
                allowedTags: ['b', 'i']
            },
            meta: {}
        };

        const value = {
            html: {
                en: `<b>Bold</b><i>Italic</i><u>Underline</u>`
            }
        };

        const html = renderHtmlField(value, baseOptions, field);
        expect(html).toContain('<b>Bold</b>');
        expect(html).toContain('<i>Italic</i>');
        expect(html).not.toContain('u');
    });

    it('includes allowed attributes', () => {
        const field: Field = {
            type: 'core/html',
            label: 'HTML Field',
            options: {},
            meta: {}
        };

        const value = {
            html: {
                en: `<a href="https://example.com" class="btn" style="color:red;">Click</a>`
            }
        };

        const html = renderHtmlField(value, baseOptions, field);
        expect(html).toContain('href="https://example.com"');
        expect(html).toContain('class="btn"');
        expect(html).toContain('style="color:red');
    });

    it('returns empty string if value is missing or not localized', () => {
        const field: Field = {
            type: 'core/html',
            label: 'HTML Field',
            options: {},
            meta: {}
        };

        expect(renderHtmlField(null, baseOptions, field)).toBe('');
        expect(renderHtmlField({}, baseOptions, field)).toBe('');
        expect(renderHtmlField({ html: {} }, baseOptions, field)).toBe('');
    });
});
