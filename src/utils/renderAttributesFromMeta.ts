import { BlockMeta } from '../types/Block';

export function renderAttributesFromMeta(meta?: BlockMeta): string {
    if (!meta || typeof meta !== 'object') return '';

    const attrs: string[] = [];

    if (meta.id) {
        attrs.push(`id="${meta.id}"`);
    }

    if (meta.customClass) {
        attrs.push(`class="${meta.customClass}"`);
    }

    if (meta.customStyle) {
        const style =
            typeof meta.customStyle === 'string'
                ? meta.customStyle
                : Object.entries(meta.customStyle)
                      .map(([key, value]) => `${key}:${value};`)
                      .join(' ');
        attrs.push(`style="${style}"`);
    }

    if (meta.attributes && typeof meta.attributes === 'object') {
        for (const [key, value] of Object.entries(meta.attributes)) {
            if (value !== undefined && value !== null) {
                attrs.push(`${key}="${value}"`);
            }
        }
    }

    return attrs.length > 0 ? ` ${attrs.join(' ')}` : '';
}
