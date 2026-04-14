export type BankId =
  | 'cbe'
  | 'cbebirr'
  | 'telebirr'
  | 'dashen'
  | 'awash'
  | 'wegagen'
  | 'boa'
  | 'unknown';

export type TransactionType = 'credit' | 'debit';

export type ParsingConfidence = 'high' | 'medium' | 'low';

export type ParsedSms = {
  bankId: BankId;
  bankName: string;
  sender: string;
  type: TransactionType;
  amount: number;
  balance: number | null;
  date: string;
  currency: 'ETB';
  confidence: ParsingConfidence;
  accountNumberHint?: string | null;
  rawMessage: string;
};
