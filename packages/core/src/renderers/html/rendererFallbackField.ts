import { Field } from '@moteur/types/Field';
import { RenderOptions } from '@moteur/types/Renderer';

export function renderFallbackField(value: any, options: RenderOptions, field: Field): string {
    return String(value);
}
