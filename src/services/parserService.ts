import { ParsedSms } from '../models';
import { parseBoaSms } from '../parsers/boaParser';
import { parseGenericSms } from '../parsers/genericParser';

export function parseSms(message: string, sender: string): ParsedSms | null {
  if (sender.trim().toUpperCase() === 'BOA') {
    return parseBoaSms(message, sender);
  }

  return parseGenericSms(message, sender);
}
