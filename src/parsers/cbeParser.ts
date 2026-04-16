import { ParsedSms } from '../models';

function parseAmount(value: string) {
  return Number(value.replace(/,/g, ''));
}

export function parseCbeSms(message: string, sender = 'CBE'): ParsedSms | null {
  const normalized = message.trim();

  // Pattern 1: "credited with ETB X.X... balance is ETB Y.Y"
  // Pattern 2: "A credit transaction of ETB X.X... current balance is ETBY.Y"
  const creditMatch =
    normalized.match(/credited with ETB\s*([\d,]+(?:\.\d{1,2})?).*balance is ETB\s*([\d,]+(?:\.\d{1,2})?)/i) ||
    normalized.match(/credit transaction of ETB\s*([\d,]+(?:\.\d{1,2})?).*balance is ETB\s*([\d,]+(?:\.\d{1,2})?)/i);

  // Pattern 1: "debited ETB X.X... balance is ETB Y.Y"
  // Pattern 2: "A debit transaction of ETB X.X... current balance is ETBY.Y"
  const debitMatch =
    normalized.match(/debited ETB\s*([\d,]+(?:\.\d{1,2})?).*balance is ETB\s*([\d,]+(?:\.\d{1,2})?)/i) ||
    normalized.match(/debit transaction of ETB\s*([\d,]+(?:\.\d{1,2})?).*balance is ETB\s*([\d,]+(?:\.\d{1,2})?)/i);

  if (creditMatch) {
    return {
      bankId: 'cbe',
      bankName: 'Commercial Bank of Eth',
      sender,
      type: 'credit',
      amount: parseAmount(creditMatch[1]),
      balance: parseAmount(creditMatch[2]),
      date: new Date().toISOString(),
      currency: 'ETB',
      confidence: 'high',
      rawMessage: normalized,
    };
  }

  if (debitMatch) {
    return {
      bankId: 'cbe',
      bankName: 'Commercial Bank of Eth',
      sender,
      type: 'debit',
      amount: parseAmount(debitMatch[1]),
      balance: parseAmount(debitMatch[2]),
      date: new Date().toISOString(),
      currency: 'ETB',
      confidence: 'high',
      rawMessage: normalized,
    };
  }

  return null;
}
