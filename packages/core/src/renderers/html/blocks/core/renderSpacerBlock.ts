import { Block } from '@moteur/types/Block';
import { RenderOptions } from '@moteur/types/Renderer';
import { renderAttributesFromMeta } from '../../../../utils/renderAttributesFromMeta';

export function renderSpacerBlock(block: Block, _opts: RenderOptions): string {
    const data = block.data ?? {};
    const meta = block.meta ?? {};
    const blockId = meta.id ?? `spacer-${Math.random().toString(36).slice(2)}`;

    const size = data.size ?? 1;
    const unit = data.unit ?? 'rem'; // fallback to rem for safety

    const inlineStyle = `height: ${size}${unit}`;

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
