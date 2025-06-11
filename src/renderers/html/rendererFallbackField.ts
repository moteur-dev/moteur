import { Field } from '../../types/Field';
import { RenderOptions } from '../../types/Renderer';

export function renderFallbackField(value: any, options: RenderOptions, field: Field): string {
    return String(value);
}
