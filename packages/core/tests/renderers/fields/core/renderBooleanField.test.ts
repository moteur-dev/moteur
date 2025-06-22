import { renderBooleanField } from '../../../../src/renderers/html/fields/core/renderBooleanField';
import type { Field } from '@moteur/types/Field';
import type { RenderOptions } from '@moteur/types/Renderer';

const baseOptions: RenderOptions = {
    locale: 'en'
};

describe('renderBooleanField', () => {
    it('renders true with default label', () => {
        const field: Field = {
            type: 'core/boolean',
            label: 'Test Boolean',
            options: {},
            meta: {}
        };

        const html = renderBooleanField(true, baseOptions, field);
        expect(html).toContain('Yes');
        expect(html).toContain('class="boolean"');
    });

    it('renders false with default label', () => {
        const field: Field = {
            type: 'core/boolean',
            label: 'Test Boolean',
            options: {},
            meta: {}
        };

        const html = renderBooleanField(false, baseOptions, field);
        expect(html).toContain('No');
    });

    it('renders with custom true/false labels', () => {
        const field: Field = {
            type: 'core/boolean',
            label: 'Test Boolean',
            options: {
                trueLabel: '✅ Confirmed',
                falseLabel: '❌ Denied'
            },
            meta: {}
        };

        const trueHtml = renderBooleanField(true, baseOptions, field);
        const falseHtml = renderBooleanField(false, baseOptions, field);

        expect(trueHtml).toContain('✅ Confirmed');
        expect(falseHtml).toContain('❌ Denied');
    });

    it('renders false label for invalid or missing value', () => {
        const field: Field = {
            type: 'core/boolean',
            label: 'Test Boolean',
            options: {},
            meta: {}
        };

        expect(renderBooleanField(undefined, baseOptions, field)).toContain('No');
        expect(renderBooleanField(null, baseOptions, field)).toContain('No');
        expect(renderBooleanField('not-a-boolean', baseOptions, field)).toContain('No');
    });

    it('includes meta attributes if present in field.meta', () => {
        const field: Field = {
            type: 'core/boolean',
            label: 'Test Boolean',
            options: {},
            meta: {
                id: 'custom-id',
                customClass: 'extra-class'
            }
        };

        const html = renderBooleanField(true, baseOptions, field);
        expect(html).toContain('id="custom-id"');
        expect(html).toContain('class="extra-class"');
    });
});
