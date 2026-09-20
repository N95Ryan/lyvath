import fr from './fr.json';

import en from './en.json';

const translations = {
  fr,
  en,
} as const;

type Language = keyof typeof translations;

export function resolveContactLang(locale: string): Language {
  return locale === "fr" ? "fr" : "en";
}

export function getTranslator(lang: Language) {
  return function t(key: string): string {
    const keys = key.split('.');
    let value: any = translations[lang];

    for (const k of keys) {
      if (value === undefined) return key;
      value = value[k];
    }

    return typeof value === 'string' ? value : key;
  };
}

export const languages = Object.keys(translations) as Language[]; 