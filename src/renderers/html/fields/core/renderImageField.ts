import { Field } from '../../../../types/Field';
import { RenderOptions } from '../../../../types/Renderer';
import { renderAttributesFromMeta } from '../../../../utils/renderAttributesFromMeta';

export function renderImageField(value: any, options: RenderOptions, field: Field): string {
    if (!value?.src) return '';

    const attrs = renderAttributesFromMeta(field.meta);
    const locale = options.locale;

    const src = value.src;
    const alt = value.alt?.[locale] || '';
    const ariaLabel = value.ariaLabel?.[locale];
    const role = value.role || 'img';

    const isDecorative = field.options?.decorative === true;
    const loading = field.options?.loading || 'lazy';
    const objectFit = field.options?.objectFit || 'cover';
    const focalPoint = field.options?.focalPoint || 'center';

    const style = `
    object-fit: ${objectFit};
    object-position: ${focalPoint};
  `.trim();

    const classAttr =
        field.options?.responsive !== false ? 'image-field responsive' : 'image-field';

    return `
    <img
      src="${src}"
      ${isDecorative ? 'alt="" role="presentation" aria-hidden="true"' : `alt="${alt}"${ariaLabel ? ` aria-label="${ariaLabel}"` : ''} role="${role}"`}
      loading="${loading}"
      class="${classAttr}"
      style="${style}"
      ${attrs}
    />
  `.trim();
}
