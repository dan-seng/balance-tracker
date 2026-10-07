import { setCustomBanks } from '../src/parsers/genericParser';
import { parseSms } from '../src/services/parserService';

describe('parseSms sender gating', () => {
  afterEach(() => setCustomBanks([]));

  test('ignores Safaricom even if configured as a custom bank', () => {
    setCustomBanks([{ bankId: 'custom-safaricom', bankName: 'Safaricom', senderId: 'Safaricom' }]);
    const message = 'Payment received ETB 200. Available balance ETB 900.';
    for (const sender of ['Safaricom', 'SAFARICOM', 'safaricom', ' Safaricom ']) {
      expect(parseSms(message, sender)).toBeNull();
    }
    expect(parseSms(message, 'mpesa')?.bankId).toBe('mpesa');
  });

  test('ignores the 251994 sender so it is never read as a bank or wallet', () => {
    // Matches the generic credit patterns, so this was previously parsed into a
    // "custom-251994" account before the ignore list existed.
    const message =
      'Your 251994 account was credited ETB 500.00. Available balance ETB 1,000.00.';

    expect(parseSms(message, '251994')).toBeNull();
    expect(parseSms(message, ' 251994 ')).toBeNull();
    expect(parseSms(message, '251994')).toBeNull();
  });

  test('still parses known banks normally', () => {
    const parsed = parseSms(
      'Dear Customer, your account ****7333 was credited with ETB 7,600.00. Available balance is ETB 33,440.00. Awash Bank.',
      'awash',
    );

    expect(parsed).not.toBeNull();
    expect(parsed?.bankId).toBe('awash');
    expect(parsed?.type).toBe('credit');
    expect(parsed?.amount).toBe(7600);
  });
});