import { BankId } from './parsedSms';

export type Account = {
  id: string;
  bankId: BankId;
  bankName: string;
  accountNumber: string;
  currentBalance: number;
  currency: 'ETB';
  lastUpdated: string;
  source: 'sms';
  subId?: number | null;
};
