import { moteurConfig } from '../../moteur.config';

/**
 * Resolves a multilingual value with fallback support.
 *
 * @param value - The multilingual field (e.g., { en: "Hello", fr: "Bonjour" })
 * @param locale - The preferred locale (e.g., "fr")
 * @returns The resolved string or empty string
 */
export function resolveLocalizedValue(value: any, locale: string): string {
    if (typeof value === 'string') return value;

    if (value && typeof value === 'object') {
        if (value[locale]) return value[locale];

        const fallbackStrategy = moteurConfig.renderer.fallbackLocaleStrategy;

        if (
            fallbackStrategy === 'default' &&
            moteurConfig.defaultLocale &&
            value[moteurConfig.defaultLocale]
        ) {
            return value[moteurConfig.defaultLocale];
        }

        if (fallbackStrategy === 'first-available') {
            const first = Object.values(value).find(v => typeof v === 'string');
            if (first) return first;
        }
    }

    return '';
}
