import { getTranslator, resolveContactLang } from "@/i18n";

export const FIELD_LIMITS = {
  nameMin: 2,
  nameMax: 100,
  emailMax: 254,
  subjectMin: 3,
  subjectMax: 200,
  messageMin: 10,
  messageMax: 2000,
} as const;

export const MIN_SUBMIT_DELAY_MS = 3000;

const VOWEL_RATIO_THRESHOLD = 0.18;
const GIBBERISH_MIN_LENGTH = 20;

const WORD_REGEX = /\b[a-zA-ZÀ-ÿ0-9'-]+\b/g;

export function countWords(text: string): number {
  const matches = text.match(WORD_REGEX);
  return matches ? matches.length : 0;
}

export function vowelRatio(text: string): number {
  const letters = text.match(/[a-zA-ZÀ-ÿ]/g);
  if (!letters || letters.length === 0) return 0;

  const vowels = letters.filter((c) => /[aeiouyAEIOUYàâäéèêëïîôùûüœæÀÂÄÉÈÊËÏÎÔÙÛÜŒÆ]/i.test(c));
  return vowels.length / letters.length;
}

export function isGibberish(text: string): boolean {
  if (text.length < GIBBERISH_MIN_LENGTH) return false;
  return vowelRatio(text) < VOWEL_RATIO_THRESHOLD;
}

export interface ContactFields {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export function validateContactContent(fields: ContactFields, locale: string): string | null {
  const t = getTranslator(resolveContactLang(locale));
  const { name, subject, message } = fields;

  if (name.length < FIELD_LIMITS.nameMin) {
    return t("contact.errors.nameMin");
  }
  if (name.length > FIELD_LIMITS.nameMax) {
    return t("contact.errors.nameMax");
  }
  if (subject.length < FIELD_LIMITS.subjectMin) {
    return t("contact.errors.subjectMin");
  }
  if (subject.length > FIELD_LIMITS.subjectMax) {
    return t("contact.errors.subjectMax");
  }
  if (message.length < FIELD_LIMITS.messageMin) {
    return t("contact.errors.messageMin");
  }
  if (message.length > FIELD_LIMITS.messageMax) {
    return t("contact.errors.messageMax");
  }
  if (countWords(message) < 2) {
    return t("contact.errors.messageWords");
  }
  if (isGibberish(subject)) {
    return t("contact.errors.subjectInvalid");
  }
  if (isGibberish(message)) {
    return t("contact.errors.messageInvalid");
  }

  return null;
}

export function isHoneypotTriggered(company: string): boolean {
  return company.trim().length > 0;
}

export function validateSubmissionTiming(formLoadedAt: number, locale: string): string | null {
  const t = getTranslator(resolveContactLang(locale));

  if (!formLoadedAt || formLoadedAt <= 0) {
    return t("contact.tooFast");
  }
  if (Date.now() - formLoadedAt < MIN_SUBMIT_DELAY_MS) {
    return t("contact.tooFast");
  }
  return null;
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function validateEmail(email: string, locale: string): string | null {
  const t = getTranslator(resolveContactLang(locale));
  const trimmed = email.trim();

  if (!trimmed) {
    return t("contact.errors.emailRequired");
  }
  if (trimmed.length > FIELD_LIMITS.emailMax) {
    return t("contact.errors.emailMax");
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return t("contact.errors.emailInvalid");
  }
  return null;
}
