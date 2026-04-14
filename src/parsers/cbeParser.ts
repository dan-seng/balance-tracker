import { ParsedSms } from '../models';

function parseAmount(value: string) {
  return Number(value.replace(/,/g, ''));
}

export function parseCbeSms(message: string, sender = 'CBE'): ParsedSms | null {
  const normalized = message.trim();
  const creditMatch = normalized.match(
    /credited with ETB\s*([\d,]+(?:\.\d{1,2})?).*balance is ETB\s*([\d,]+(?:\.\d{1,2})?)/i,
  );
  const debitMatch = normalized.match(
    /debited ETB\s*([\d,]+(?:\.\d{1,2})?).*balance is ETB\s*([\d,]+(?:\.\d{1,2})?)/i,
  );

  if (creditMatch) {
    return {
      bankId: 'cbe',
      bankName: 'Commercial Bank of Ethiopia',
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
      bankName: 'Commercial Bank of Ethiopia',
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
