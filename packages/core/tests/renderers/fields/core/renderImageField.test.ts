import { describe, it, expect } from 'vitest';

import { renderImageField } from '../../../../src/renderers/html/fields/core/renderImageField';
import type { Field } from '@moteur/types/Field';
import type { RenderOptions } from '@moteur/types/Renderer';

const baseOptions: RenderOptions = {
    locale: 'en'
};

describe('renderImageField', () => {
    const baseField: Field = {
        type: 'core/image',
        label: 'Test Image',
        options: {},
        meta: {}
    };

    it('renders image with alt text and default attributes', () => {
        const value = {
            src: '/img/test.jpg',
            alt: { en: 'Test image' }
        };

        const html = renderImageField(value, baseOptions, baseField);
        expect(html).toContain('src="/img/test.jpg"');
        expect(html).toContain('alt="Test image"');
        expect(html).toContain('role="img"');
        expect(html).toContain('loading="lazy"');
        expect(html).toContain('class="image-field responsive"');
        expect(html).toMatch(/style="object-fit:\s*cover;\s*object-position:\s*center;"/);
    });

    it('renders decorative image with appropriate ARIA', () => {
        const field: Field = {
            ...baseField,
            options: { decorative: true }
        };

        const value = {
            src: '/img/decorative.jpg'
        };

        const html = renderImageField(value, baseOptions, field);
        expect(html).toContain('alt=""');
        expect(html).toContain('role="presentation"');
        expect(html).toContain('aria-hidden="true"');
    });

    it('includes aria-label if provided', () => {
        const value = {
            src: '/img/accessible.jpg',
            alt: { en: 'Accessible image' },
            ariaLabel: { en: 'A description for screen readers' }
        };

        const html = renderImageField(value, baseOptions, baseField);
        expect(html).toContain('aria-label="A description for screen readers"');
    });

    it('respects custom loading, objectFit, focalPoint and disables responsive class', () => {
        const field: Field = {
            ...baseField,
            options: {
                loading: 'eager',
                objectFit: 'contain',
                focalPoint: 'top left',
                responsive: false
            }
        };

        const value = {
            src: '/img/custom.jpg',
            alt: { en: 'Custom image' }
        };

        const html = renderImageField(value, baseOptions, field);
        expect(html).toContain('loading="eager"');
        expect(html).toContain('class="image-field"');
        expect(html).toContain('object-fit: contain');
        expect(html).toContain('object-position: top left');
    });

    it('returns empty string if no src is present', () => {
        const html = renderImageField({}, baseOptions, baseField);
        expect(html).toBe('');
    });

    it('includes meta attributes if defined in field.meta', () => {
        const field: Field = {
            ...baseField,
            meta: {
                id: 'img-id',
                customClass: 'featured'
            }
        };

        const value = {
            src: '/img/meta.jpg',
            alt: { en: 'With meta' }
        };

        const html = renderImageField(value, baseOptions, field);
        expect(html).toContain('id="img-id"');
        expect(html).toContain('class="image-field responsive"');
        expect(html).toContain('class="featured"'); // assuming renderAttributesFromMeta appends class
    });
});
