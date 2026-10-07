import { Account, ParsedSms } from '../src/models';
import { parseSms } from '../src/services/parserService';
import {
  setCustomBanks,
  extractAccountNumberHint,
} from '../src/parsers/genericParser';
import {
  applyAccountIdentity,
  resolveAccountForSms,
  toDisplayAccountNumber,
} from '../src/utils/accountIdentity';

const account = (number: string, subId?: number): Account => ({
  id: number,
  bankId: 'cbe',
  bankName: 'CBE',
  accountNumber: number,
  currentBalance: 1000,
  currency: 'ETB',
  lastUpdated: '2026-10-01T00:00:00Z',
  source: 'sms',
  subId,
});
const sms = (hint: string | null): ParsedSms => ({
  bankId: 'cbe',
  bankName: 'CBE',
  sender: 'CBE',
  type: 'debit',
  amount: 100,
  balance: 900,
  currency: 'ETB',
  date: '2026-10-01T00:00:00Z',
  confidence: 'high',
  accountNumberHint: hint,
  rawMessage: '',
});
afterEach(() => setCustomBanks([]));

test('phone numbers and transaction references are not account identities', () => {
  for (const sender of ['CBE', '127']) {
    const parsed = parseSms(
      'You have paid ETB 100.00 to Abebe (0912345678). Transaction ID: 123456789012. Your current balance is ETB 900.00.',
      sender,
    )!;
    expect(parsed.accountNumberHint).toBeNull();
  }
  expect(
    extractAccountNumberHint(
      'You transferred ETB 100 to account 1000123456789. Your account ****3012 balance is ETB 900.',
    ),
  ).toBe('****3012');
  expect(
    extractAccountNumberHint(
      'You received ETB 100 from account ****9999. Current balance is ETB 900.',
    ),
  ).toBeNull();
  expect(
    extractAccountNumberHint('Paid ETB 100. Reference ****1234.'),
  ).toBeNull();
});

test.each(['cbe', 'telebirr'])(
  'one %s account survives missing account hints and receiving-SIM changes',
  bankId => {
    const existing = { ...account('100012343012'), bankId };
    for (const subId of [undefined, null, -1, 1, 2]) {
      expect(
        resolveAccountForSms([existing], { ...sms(null), bankId }, subId),
      ).toEqual({ kind: 'matched', account: existing });
    }
  },
);

test('full and masked owner labels identify the same account and upgrade placeholders', () => {
  expect(
    extractAccountNumberHint(
      'Dear Customer, your account ****3012 has been credited with ETB 100.',
    ),
  ).toBe('****3012');
  expect(
    extractAccountNumberHint(
      'Dear Customer, A/C 100012343012 was debited ETB 100.',
    ),
  ).toBe('100012343012');
  const existing = account('•••• ••••', 1);
  expect(resolveAccountForSms([existing], sms('****3012'), 1)).toEqual({
    kind: 'matched',
    account: existing,
  });
  expect(applyAccountIdentity(existing, sms('****3012'), 1)).toBe(true);
  expect(existing.accountNumber).toBe('•••• 3012');
  expect(resolveAccountForSms([existing], sms('100012343012'), 2)).toEqual({
    kind: 'matched',
    account: existing,
  });
  expect(applyAccountIdentity(existing, sms('100012343012'))).toBe(true);
  expect(existing.accountNumber).toBe('100012343012');
});

test('different full accounts remain separate even on the same SIM or with identical last digits', () => {
  const existing = account('100012343012', 1);
  expect(resolveAccountForSms([existing], sms('100099993012'), 1)).toEqual({
    kind: 'new',
  });
  expect(resolveAccountForSms([existing], sms('****8877'), 1)).toEqual({
    kind: 'new',
  });
});

test('missing or ambiguous hints do not invent an extra account or pick the first account', () => {
  const one = account('100012343012', 1),
    two = account('100099993012', 1);
  expect(resolveAccountForSms([one, two], sms(null), 1)).toEqual({
    kind: 'ambiguous',
  });
  expect(resolveAccountForSms([one, two], sms('****3012'), 1)).toEqual({
    kind: 'ambiguous',
  });
  expect(
    resolveAccountForSms([one, { ...two, subId: 2 }], sms(null), 2),
  ).toEqual({ kind: 'matched', account: { ...two, subId: 2 } });
});

test('masked six-digit tails stay masked and do not overwrite a full account', () => {
  expect(toDisplayAccountNumber('XXXX343012')).toBe('•••• 343012');
  const existing = account('100012343012');
  expect(resolveAccountForSms([existing], sms('XXXX343012'))).toEqual({
    kind: 'matched',
    account: existing,
  });
  expect(applyAccountIdentity(existing, sms('XXXX343012'))).toBe(false);
  expect(existing.accountNumber).toBe('100012343012');
});

test('imports repeated CBE and Telebirr notifications as one account per bank', () => {
  const accounts: Account[] = [];
  const messages = [
    [
      'CBE',
      'Your account ****3012 was credited with ETB 100. Balance is ETB 1000.',
    ],
    [
      'CBE',
      'Paid ETB 100 to Abebe (0912345678). Ref 123456789012. Balance is ETB 900.',
    ],
    [
      'CBE',
      'Your account 100012343012 was debited ETB 50. Balance is ETB 850.',
    ],
    ['127', 'You received ETB 200 from Hana (0911111111). Balance is ETB 200.'],
    [
      '127',
      'You sent ETB 50 to Abel (0922222222). Reference 999999999999. Balance is ETB 150.',
    ],
    ['127', 'You paid ETB 20 to merchant 0933333333. Balance is ETB 130.'],
  ];
  messages.forEach(([sender, message], index) => {
    const parsed = parseSms(message, sender)!;
    const resolution = resolveAccountForSms(
      accounts,
      parsed,
      index % 2 ? undefined : 1,
    );
    expect(resolution.kind).not.toBe('ambiguous');
    if (resolution.kind === 'new')
      accounts.push({
        ...account(toDisplayAccountNumber(parsed.accountNumberHint)),
        id: String(index),
        bankId: parsed.bankId,
        currentBalance: parsed.balance!,
      });
    if (resolution.kind === 'matched') {
      applyAccountIdentity(resolution.account, parsed);
      resolution.account.currentBalance = parsed.balance!;
    }
  });
  expect(accounts).toHaveLength(2);
  expect(accounts.map(a => [a.bankId, a.currentBalance])).toEqual([
    ['cbe', 850],
    ['telebirr', 130],
  ]);
});

test('non-bank senders cannot fabricate accounts unless explicitly registered', () => {
  const message = 'Payment received ETB 200. Balance ETB 900.';
  expect(parseSms(message, 'RandomShop')).toBeNull();
  setCustomBanks([
    { bankId: 'custom-shop', bankName: 'My Bank', senderId: 'RandomShop' },
  ]);
  expect(parseSms(message, 'RandomShop')?.bankId).toBe('custom-shop');
});
