import { Block } from '../../../../types/Block';
import { RenderOptions } from '../../../../types/Renderer';
import { renderAttributesFromMeta } from '../../../../utils/renderAttributesFromMeta';
import { resolveLocalizedValue } from '../../../../utils/resolveLocalizedValue';
import { renderFieldFromBlockSchema } from '../../renderFieldFromBlockSchema';

export function renderHeroBlock(block: Block, opts: RenderOptions): string {
    const { locale } = opts;
    const data = block.data ?? {};
    const meta = block.meta ?? {};
    if (meta.hidden) {
        return '';
    }
    const blockId = meta.id ?? `hero-${Math.random().toString(36).slice(2)}`;

    const headingText = resolveLocalizedValue(data.title, locale);
    const headingLevel = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(data.headingLevel)
        ? data.headingLevel
        : 'h1';

    const subtitle = resolveLocalizedValue(data.subtitle, locale);
    const backgroundColor = data.backgroundColor ?? '#ffffff';
    const backgroundImage = data.backgroundImage?.src;
    const alignment = data.alignment ?? 'center';

    const styleParts = [`background-color: ${backgroundColor}`];
    if (backgroundImage) {
        styleParts.push(`background-image: url('${backgroundImage}')`);
    }

    const attrs = renderAttributesFromMeta({
        ...meta,
        customClass: `hero hero--${alignment} ${meta.customClass ?? ''}`,
        customStyle: styleParts.join('; '),
        attributes: {
            role: 'region',
            'aria-labelledby': `${blockId}-title`,
            ...(meta.attributes || {})
        },
        id: blockId
    });

    const ctaHtml = renderFieldFromBlockSchema(block, 'cta', opts);

    return `
    <section${attrs}>
      <div class="hero__content">
        <${headingLevel} id="${blockId}-title" class="hero__title">${headingText}</${headingLevel}>
        ${subtitle ? `<div class="hero__subtitle">${subtitle}</div>` : ''}
        ${ctaHtml}
      </div>
    </section>
  `;
}
