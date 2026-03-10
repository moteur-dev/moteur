import { Block } from '@moteur/types/Block.js';
import { RenderOptions } from '@moteur/types/Renderer.js';
import { renderAttributesFromMeta } from '../../../../utils/renderAttributesFromMeta.js';

export function renderSpacerBlock(block: Block, _opts: RenderOptions): string {
    const data = block.data ?? {};
    const meta = block.meta ?? {};
    const blockId = meta.id ?? `spacer-${Math.random().toString(36).slice(2)}`;

    const sizeMap: Record<string, string> = {
        xs: '0.5rem',
        sm: '1rem',
        md: '2rem',
        lg: '4rem',
        xl: '8rem'
    };

    const sizeValue = data.size ?? 'md';
    const customPx = data.custom;
    const inlineStyle = customPx
        ? `height: ${customPx}px`
        : `height: ${sizeMap[sizeValue] ?? sizeMap.md}`;

    const attrs = renderAttributesFromMeta({
        ...meta,
        customClass: `spacer ${meta.customClass ?? ''}`,
        customStyle: inlineStyle,
        attributes: {
            'aria-hidden': 'true',
            role: 'presentation',
            ...(meta.attributes || {})
        },
        id: blockId
    });

    return `<div${attrs}></div>`;
}
