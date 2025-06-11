import { Block } from '../../../../types/Block';
import { RenderOptions } from '../../../../types/Renderer';
import { renderAttributesFromMeta } from '../../../../utils/renderAttributesFromMeta';
import { resolveLocalizedValue } from '../../../../utils/resolveLocalizedValue';
import { renderField } from '../../htmlFieldRenderer';

export function renderQuoteBlock(block: Block, opts: RenderOptions): string {
    const { locale } = opts;
    const data = block.data ?? {};
    const meta = block.meta ?? {};
    const blockId = meta.id ?? `quote-${Math.random().toString(36).slice(2)}`;

    const quoteText = resolveLocalizedValue(data.text, locale);
    const authorText = resolveLocalizedValue(data.author, locale);
    const authorImage = renderField('core/image', data.authorImage, opts, {
        type: 'core/image',
        label: 'Author Image'
    });

    const attrs = renderAttributesFromMeta({
        ...meta,
        customClass: `quote ${meta.customClass ?? ''}`,
        attributes: {
            role: 'group',
            'aria-labelledby': `${blockId}-text`,
            ...(meta.attributes || {})
        },
        id: blockId
    });

    return `
    <blockquote${attrs}>
      <p id="${blockId}-text" class="quote__text">${quoteText}</p>
      ${
          authorText || authorImage
              ? `<footer class="quote__footer">
              ${authorImage ? `<div class="quote__author-image">${authorImage}</div>` : ''}
              ${authorText ? `<cite class="quote__author">${authorText}</cite>` : ''}
            </footer>`
              : ''
      }
    </blockquote>
  `;
}
