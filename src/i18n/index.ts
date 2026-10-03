import { useSyncExternalStore } from 'react';
import { am } from './am';

export type Language = 'en' | 'am';
let language: Language = 'en';
const listeners = new Set<() => void>();
export const getLanguage = (): Language => language;
export const getLocale = () => (language === 'am' ? 'am-ET' : 'en-ET');
export const isLanguage = (value: unknown): value is Language =>
  value === 'en' || value === 'am';

export function setLanguage(value: Language) {
  if (value === language) return;
  language = value;
  listeners.forEach(listener => listener());
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
export function useLanguage() {
  return useSyncExternalStore(subscribe, getLanguage, getLanguage);
}

// Translate only authored UI copy. Names, SMS, identifiers and saved records
// are deliberately passed through by their callers, never translated globally.
export function t(
  key: string,
  values: Record<string, string | number> = {},
): string {
  const copy =
    language === 'am' && Object.prototype.hasOwnProperty.call(am, key)
      ? am[key as keyof typeof am]
      : key;
  return copy.replace(/\{(\w+)\}/g, (match, name) =>
    Object.prototype.hasOwnProperty.call(values, name)
      ? String(values[name])
      : match,
  );
}
