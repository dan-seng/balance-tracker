import { ParsedSms } from '../models';
import { parseCbeSms } from '../parsers/cbeParser';

export function parseSms(message: string, sender: string): ParsedSms | null {
  if (sender.toUpperCase().includes('CBE')) {
    return parseCbeSms(message, sender);
  }

  return null;
}
