const { mkdtempSync, rmSync } = require('fs');
const { tmpdir } = require('os');
const { join } = require('path');
let mockDbPath = '';
let directory = '';
jest.mock('react-native-sqlite-storage', () => ({
  enablePromise: jest.fn(),
  openDatabase: async () => ({
    executeSql: async (sql: string, params: unknown[] = []) => {
      const { spawnSync } = require('child_process');
      const result = spawnSync(
        'python3',
        [
          '-c',
          `
import sys,json,sqlite3
with sqlite3.connect(sys.argv[1]) as db:
 db.row_factory=sqlite3.Row
 cursor=db.execute(sys.argv[2], json.loads(sys.argv[3]))
 print(json.dumps([dict(row) for row in cursor.fetchall()] if cursor.description else []))
`,
          mockDbPath,
          sql,
          JSON.stringify(params),
        ],
        { encoding: 'utf8' },
      );
      if (result.status !== 0) throw new Error(result.stderr);
      const rows = JSON.parse(result.stdout);
      return [
        { rows: { length: rows.length, item: (index: number) => rows[index] } },
      ];
    },
  }),
}));
import {
  initDatabase,
  saveAccount,
  saveTransaction,
  getTransactions,
  deleteAllTransactions,
  setTransactionReason,
} from '../src/db/sqliteDatabase';
import { Transaction } from '../src/models';
beforeAll(async () => {
  directory = mkdtempSync(join(tmpdir(), 'hisab-notes-'));
  mockDbPath = join(directory, 'bank.db');
  await initDatabase();
});
afterAll(() => rmSync(directory, { recursive: true, force: true }));
test('persists notes through clearing and reimporting transactions and validates editing', async () => {
  await saveAccount({
    id: 'a',
    bankId: 'cbe',
    bankName: 'CBE',
    accountNumber: '1234567890',
    currentBalance: 500,
    currency: 'ETB',
    source: 'sms',
    lastUpdated: '2026-10-07T10:00:00.000Z',
  });
  const transaction: Transaction = {
    id: 't',
    accountId: 'a',
    bankId: 'cbe',
    bankName: 'CBE',
    type: 'debit',
    amount: 100,
    balanceAfter: 500,
    date: '2026-10-07T10:00:00.000Z',
    rawSms: 'Paid ETB 100',
    hash: 'hash',
    currency: 'ETB',
    sender: 'CBE',
  };
  await saveTransaction(transaction);
  await setTransactionReason('hash', '  Lunch  ');
  expect((await getTransactions())[0].reason).toBe('Lunch');
  await deleteAllTransactions();
  await saveTransaction({ ...transaction, id: 'reimported' });
  expect((await getTransactions())[0].reason).toBe('Lunch');
  expect((await getTransactions())[0].amount).toBe(100);
  await expect(setTransactionReason('hash', 'x'.repeat(201))).rejects.toThrow(
    '200',
  );
  await setTransactionReason('hash', '');
  expect((await getTransactions())[0].reason).toBeUndefined();
  await expect(setTransactionReason('missing', 'Note')).rejects.toThrow(
    'no longer available',
  );
});
