import { Field } from '@moteur/types/Field';
import { RenderOptions } from '@moteur/types/Renderer';
import { renderAttributesFromMeta } from '../../../../utils/renderAttributesFromMeta';

export function renderLinkField(value: any, options: RenderOptions, field: Field): string {
    if (!value?.url) {
        return '';
    }

    const label = value.label?.[options.locale] ?? value.url;
    const ariaLabel = value.ariaLabel?.[options.locale];
    const target = value.target ?? '_self';
    const rel = Array.isArray(value.rel) ? value.rel.join(' ') : '';
    const meta = value.meta ?? {};
    const attrs = renderAttributesFromMeta(field.meta);

    const classAttr = meta.style ? `link link--${meta.style}` : 'link';
    const icon = meta.icon ? `<span class="icon">${meta.icon}</span>` : '';

    return `
    <a href="${value.url}" class="${classAttr}" target="${target}" rel="${rel}"${attrs}
      ${ariaLabel ? `aria-label="${ariaLabel}"` : ''}>
      ${icon}${label}
    </a>
  `;
}
