import es from './locales/es.json';
import en from './locales/en.json';

export const locales = {
  es,
  en,
} as const;

export type Locale = keyof typeof locales;
export type TranslationKeys = typeof es;

export const defaultLocale: Locale = 'es';

export const localeNames: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
};

export const localeFlags: Record<Locale, string> = {
  es: '🇪🇸',
  en: '🇺🇸',
};
