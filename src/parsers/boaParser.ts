import { ParsedSms } from '../models';

function parseAmount(value: string): number {
  return Number(value.replace(/,/g, ''));
}

export function parseBoaSms(
  message: string,
  sender = 'BOA',
): ParsedSms | null {
  const normalized = message.trim();

  const typeMatch = normalized.match(/\b(credited|debited)\b/i);
  if (!typeMatch) {
    return null;
  }

  const amountMatch = normalized.match(
    /\b(?:credited|debited)(?:\s+with)?[^\dA-Z]*(?:ETB|Birr|Br\.?)?\s*([\d,]+(?:\.\d{1,2})?)/i,
  );
  if (!amountMatch) {
    return null;
  }

  const balanceMatch = normalized.match(
    /\bAvailable\s+Balance:\s*(?:ETB|Birr|Br\.?)?\s*([\d,]+(?:\.\d{1,2})?)/i,
  );
  const accountHintMatch = normalized.match(/\baccount\s+([^\s]+)\b/i);

  return {
    bankId: 'boa',
    bankName: 'BOA',
    sender,
    type: typeMatch[1].toLowerCase() === 'credited' ? 'credit' : 'debit',
    amount: parseAmount(amountMatch[1]),
    balance: balanceMatch ? parseAmount(balanceMatch[1]) : null,
    date: new Date().toISOString(),
    currency: 'ETB',
    confidence: balanceMatch ? 'high' : 'medium',
    accountNumberHint: accountHintMatch ? accountHintMatch[1] : null,
    rawMessage: normalized,
  };
}
