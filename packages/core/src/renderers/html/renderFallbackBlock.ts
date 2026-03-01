import { Block } from '@moteur/types/Block.js';
import { RenderOptions } from '@moteur/types/Renderer.js';

export function renderFallbackBlock(block: Block, _opts: RenderOptions): string {
    return `
    <div class="block--unknown">
      <pre>Unknown block type: ${block.type}</pre>
      <pre>${JSON.stringify(block.data, null, 2)}</pre>
    </div>
  `;
}
