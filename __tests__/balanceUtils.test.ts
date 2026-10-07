import { Account, ParsedSms } from '../src/models';
import { balanceForSms } from '../src/utils/balanceUtils';
const account: Account = {
  id: 'a',
  bankId: 'cbe',
  bankName: 'CBE',
  accountNumber: '1234567890',
  currentBalance: 500,
  currency: 'ETB',
  source: 'sms',
  lastUpdated: '2026-10-07T10:00:00.000Z',
};
const sms: ParsedSms = {
  bankId: 'cbe',
  bankName: 'CBE',
  sender: 'CBE',
  type: 'debit',
  amount: 100,
  balance: 200,
  currency: 'ETB',
  confidence: 'high',
  date: '2026-10-01T10:00:00.000Z',
  rawMessage: '',
};
test('an older SMS preserves the restored current balance', () => {
  expect(balanceForSms(account, sms, Date.parse(sms.date))).toEqual({
    updateCurrent: false,
    balanceAfter: 200,
  });
  expect(
    balanceForSms(account, { ...sms, balance: null }, Date.parse(sms.date)),
  ).toEqual({ updateCurrent: false, balanceAfter: null });
  expect(account.currentBalance).toBe(500);
});
test('newer SMS can update the balance, including messages without a balance', () => {
  const timestamp = Date.parse('2026-10-07T11:00:00.000Z');
  expect(balanceForSms(account, sms, timestamp)).toEqual({
    updateCurrent: true,
    balanceAfter: 200,
  });
  expect(balanceForSms(account, { ...sms, balance: null }, timestamp)).toEqual({
    updateCurrent: true,
    balanceAfter: 400,
  });
});
