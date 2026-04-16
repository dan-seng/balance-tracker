import { ParsedSms } from '../models';
import { parseBoaSms } from '../parsers/boaParser';
import { parseCbeSms } from '../parsers/cbeParser';
import { parseGenericSms } from '../parsers/genericParser';

export function parseSms(message: string, sender: string): ParsedSms | null {
  const normalizedSender = sender.trim().toUpperCase();

  if (normalizedSender === 'BOA') {
    return parseBoaSms(message, sender) || parseGenericSms(message, sender);
  }

  if (normalizedSender === 'CBE') {
    return parseCbeSms(message, sender) || parseGenericSms(message, sender);
  }

  return parseGenericSms(message, sender);
}
