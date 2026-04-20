import { Transaction } from '../models';

export type Category = 
  | 'Transfer'
  | 'Payment'
  | 'Withdrawal'
  | 'Deposit'
  | 'Received'
  | 'Other';

export function categorizeTransaction(transaction: Transaction): Category {
  const msg = transaction.rawSms.toLowerCase();
  
  if (transaction.type === 'debit') {
    if (/\b(?:transfer(?:red)?|sent)\b/.test(msg)) return 'Transfer';
    if (/\b(?:payment|purchase|paid)\b/.test(msg)) return 'Payment';
    if (/\b(?:withdraw(?:al|n)?|cash\s?out|atm)\b/.test(msg)) return 'Withdrawal';
    return 'Other';
  } else {
    // credit
    if (/\b(?:deposit(?:ed)?|cash\s?in|top\s?up)\b/.test(msg)) return 'Deposit';
    if (/\b(?:received|credited)\b/.test(msg)) return 'Received';
    return 'Other';
  }
}
