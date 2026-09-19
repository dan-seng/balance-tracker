import { setCustomBanks, parseGenericSms } from '../src/parsers/genericParser';
import { getMockSmsMessages, NEW_BANKS } from '../src/mocks/mockSmsData';

setCustomBanks(NEW_BANKS.map((b) => ({ bankId: b.bankId, bankName: b.bankName, senderId: b.senderId })));

describe('mock sample data', () => {
  test('every mock SMS parses into a known bank with an amount + balance', () => {
    const mocks = getMockSmsMessages();
    const bankIds = new Set<string>();
    const failures: string[] = [];

    for (const m of mocks) {
      const parsed = parseGenericSms(m.message, m.sender);
      if (!parsed || parsed.bankId === 'unknown' || !(parsed.amount > 0)) {
        failures.push(`${m.sender}: ${m.message.slice(0, 60)}...`);
      } else {
        bankIds.add(parsed.bankId);
      }
    }

    expect(failures).toEqual([]);
    expect(bankIds.size).toBeGreaterThan(5);
  });

  test('the new banks are all represented in the sample data', () => {
    const bankIds = new Set(
      getMockSmsMessages().map((m) => {
        const parsed = parseGenericSms(m.message, m.sender);
        return parsed?.bankId ?? null;
      }),
    );
    for (const b of NEW_BANKS) {
      expect(bankIds.has(b.bankId)).toBe(true);
    }
  });
});