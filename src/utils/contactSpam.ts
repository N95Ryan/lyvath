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

export function validateContactContent(fields: ContactFields): string | null {
  const { name, subject, message } = fields;

  if (name.length < FIELD_LIMITS.nameMin) {
    return "Le nom doit contenir au moins 2 caractères";
  }
  if (name.length > FIELD_LIMITS.nameMax) {
    return "Le nom ne doit pas dépasser 100 caractères";
  }
  if (subject.length < FIELD_LIMITS.subjectMin) {
    return "L'objet doit contenir au moins 3 caractères";
  }
  if (subject.length > FIELD_LIMITS.subjectMax) {
    return "L'objet ne doit pas dépasser 200 caractères";
  }
  if (message.length < FIELD_LIMITS.messageMin) {
    return "Le message doit contenir au moins 10 caractères";
  }
  if (message.length > FIELD_LIMITS.messageMax) {
    return "Le message ne doit pas dépasser 2000 caractères";
  }
  if (countWords(message) < 2) {
    return "Le message doit contenir au moins 2 mots";
  }
  if (isGibberish(subject)) {
    return "L'objet semble invalide";
  }
  if (isGibberish(message)) {
    return "Le message semble invalide";
  }

  return null;
}

export function isHoneypotTriggered(company: string): boolean {
  return company.trim().length > 0;
}

export function validateSubmissionTiming(formLoadedAt: number): string | null {
  if (!formLoadedAt || formLoadedAt <= 0) {
    return "Soumission trop rapide";
  }
  if (Date.now() - formLoadedAt < MIN_SUBMIT_DELAY_MS) {
    return "Soumission trop rapide";
  }
  return null;
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function validateEmail(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) {
    return "L'email est obligatoire";
  }
  if (trimmed.length > FIELD_LIMITS.emailMax) {
    return "L'email ne doit pas dépasser 254 caractères";
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return "Format d'email invalide";
  }
  return null;
}
