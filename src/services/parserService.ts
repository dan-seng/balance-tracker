import { ParsedSms } from '../models';
import { parseBoaSms } from '../parsers/boaParser';
import { parseCbeSms } from '../parsers/cbeParser';
import { parseGenericSms } from '../parsers/genericParser';

// Senders that must never be read as a bank account or wallet, even when they
// otherwise match the generic transaction patterns (e.g. service shortcodes).
const IGNORED_SENDERS = new Set(['251994', 'SAFARICOM']);

export function parseSms(message: string, sender: string): ParsedSms | null {
  const normalizedSender = sender.trim().toUpperCase();

  if (IGNORED_SENDERS.has(normalizedSender)) {
    return null;
  }

  if (normalizedSender === 'BOA') {
    return parseBoaSms(message, sender) || parseGenericSms(message, sender);
  }

  if (normalizedSender === 'CBE') {
    return parseCbeSms(message, sender) || parseGenericSms(message, sender);
  }

  return parseGenericSms(message, sender);
}
