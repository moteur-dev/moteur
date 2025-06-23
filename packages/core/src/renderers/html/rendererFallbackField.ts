import { Field } from '@moteur/types/Field';
import { RenderOptions } from '@moteur/types/Renderer';

export function renderFallbackField(value: any, _options: RenderOptions, _field: Field): string {
    return String(value);
}
