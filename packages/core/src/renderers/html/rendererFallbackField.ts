import { Field } from '@moteur/types/Field.js';
import { RenderOptions } from '@moteur/types/Renderer.js';

export function renderFallbackField(value: any, _options: RenderOptions, _field: Field): string {
    return String(value);
}
