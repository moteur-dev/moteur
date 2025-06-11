import { Block } from '../../../../types/Block';
import { RenderOptions } from '../../../../types/Renderer';
import { renderAttributesFromMeta } from '../../../../utils/renderAttributesFromMeta';
import { resolveLocalizedValue } from '../../../../utils/resolveLocalizedValue';
import { renderField } from '../../htmlFieldRenderer';

export function renderAccordionBlock(block: Block, opts: RenderOptions): string {
    const { locale } = opts;
    const data = block.data ?? {};
    const meta = block.meta ?? {};

    const items = data.subItems ?? [];
    const multiOpen = data.multiOpen ?? false;
    const blockId = meta.id ?? `accordion-${Math.random().toString(36).slice(2)}`;
    const title = resolveLocalizedValue(data.title, locale);

    const attrs = renderAttributesFromMeta({
        ...meta,
        customClass: `accordion ${meta.customClass ?? ''}`,
        attributes: {
            role: 'region',
            'aria-labelledby': title ? `${blockId}-title` : '',
            ...(meta.attributes || {})
        }
    });

    if (!Array.isArray(items) || items.length === 0) {
        return `<section${attrs}><p>No content available.</p></section>`;
    }

    const renderedItems = items
        .map((item: any, i: number) => {
            const itemTitle = resolveLocalizedValue(item.title, locale);
            const itemContent = renderField('core/rich-text', item.content, opts, {
                type: 'core/rich-text',
                label: 'Accordion item'
            });

            const itemId = `${blockId}-item-${i}`;

            return `
      <details class="accordion__item" id="${itemId}">
        <summary class="accordion__title">${itemTitle}</summary>
        <div class="accordion__content">${itemContent}</div>
      </details>
    `;
        })
        .join('\n');

    return `
    <section${attrs}>
      ${title ? `<h2 class="accordion__heading" id="${blockId}-title">${title}</h2>` : ''}
      <div class="accordion__items">
        ${renderedItems}
      </div>
    </section>
  `;
}
