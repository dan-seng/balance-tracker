import { BankId, TransactionType } from './parsedSms';

export type Transaction = {
  reason?: string;
  id: string;
  accountId: string;
  bankId: BankId;
  bankName: string;
  type: TransactionType;
  amount: number;
  balanceAfter: number | null;
  date: string;
  rawSms: string;
  hash: string;
  currency: 'ETB';
  sender: string;
};
