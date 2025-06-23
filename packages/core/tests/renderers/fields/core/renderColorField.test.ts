import { describe, it, expect } from 'vitest';

import { renderColorField } from '../../../../src/renderers/html/fields/core/renderColorField';
import type { Field } from '@moteur/types/Field';
import type { RenderOptions } from '@moteur/types/Renderer';

const baseOptions: RenderOptions = {
    locale: 'en'
};

describe('renderColorField', () => {
    it('renders color with swatch by default', () => {
        const field: Field = {
            type: 'core/color',
            label: 'Color Field',
            options: {},
            meta: {}
        };

        const value = { value: '#ff0000' };
        const html = renderColorField(value, baseOptions, field);

        expect(html).toContain('class="color-field"');
        expect(html).toContain('#ff0000');
        expect(html).toContain('style="background-color: #ff0000;');
        expect(html).toContain('class="swatch"');
        expect(html).toContain('class="color-code"');
    });

    it('renders without swatch if showSwatch is false', () => {
        const field: Field = {
            type: 'core/color',
            label: 'Color Field',
            options: {
                showSwatch: false
            },
            meta: {}
        };

        const value = { value: '#00ff00' };
        const html = renderColorField(value, baseOptions, field);

        expect(html).toContain('#00ff00');
        expect(html).not.toContain('class="swatch"');
    });

    it('returns empty string if value is missing', () => {
        const field: Field = {
            type: 'core/color',
            label: 'Color Field',
            options: {},
            meta: {}
        };

        expect(renderColorField(undefined, baseOptions, field)).toBe('');
        expect(renderColorField(null, baseOptions, field)).toBe('');
        expect(renderColorField({}, baseOptions, field)).toBe('');
    });

    it('includes meta attributes if present in field.meta', () => {
        const field: Field = {
            type: 'core/color',
            label: 'Color Field',
            options: {},
            meta: {
                id: 'color-id',
                customClass: 'my-color-class'
            }
        };

        const value = { value: '#123456' };
        const html = renderColorField(value, baseOptions, field);

        expect(html).toContain('id="color-id"');
        expect(html).toContain('class="my-color-class"');
        expect(html).toContain('#123456');
    });
});
