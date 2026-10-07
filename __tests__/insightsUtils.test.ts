import { Transaction } from '../src/models';
import {
  getInsights,
  getReportPeriod,
  shiftReportPeriod,
} from '../src/utils/insightsUtils';

const at = (year: number, month: number, day: number, hour = 0) =>
  new Date(year, month - 1, day, hour).getTime();
const txn = (
  stamp: number,
  amount = 10,
  type: 'credit' | 'debit' = 'debit',
): Transaction => ({
  id: String(stamp),
  accountId: 'cbe-1',
  bankId: 'cbe',
  bankName: 'CBE',
  type,
  amount,
  balanceAfter: 1000,
  date: new Date(stamp).toISOString(),
  rawSms: type === 'credit' ? 'Received ETB 10' : 'Paid ETB 10 to Coffee Shop',
  hash: String(stamp),
  currency: 'ETB',
  sender: 'CBE',
});

test('a midweek report runs Monday midnight through Sunday, excluding the next Monday', () => {
  const period = getReportPeriod('week', at(2026, 10, 7, 12));
  expect(period.start.getTime()).toBe(at(2026, 10, 5));
  expect(period.end.getTime()).toBe(at(2026, 10, 12));
  const report = getInsights(
    [
      txn(at(2026, 10, 4, 23), 99),
      txn(at(2026, 10, 5), 10),
      txn(at(2026, 10, 11, 23), 20),
      txn(at(2026, 10, 12), 99),
      txn(at(2026, 10, 6), 100, 'credit'),
    ],
    'week',
    at(2026, 10, 7),
  );
  expect(report.totalSpend).toBe(30);
  expect(report.totalIncome).toBe(100);
  expect(report.bars).toHaveLength(7);
  expect(report.bars.map(bar => bar.value)).toEqual([10, 0, 0, 0, 0, 0, 20]);
  expect(
    report.categories.reduce((sum, category) => sum + category.amount, 0),
  ).toBe(30);
  expect(
    report.merchants.reduce((sum, merchant) => sum + merchant.amount, 0),
  ).toBe(30);
});

test('Sunday belongs to the week that started the preceding Monday', () => {
  expect(getReportPeriod('week', at(2026, 10, 11, 22)).start.getTime()).toBe(
    at(2026, 10, 5),
  );
  expect(getReportPeriod('week', at(2026, 10, 12)).start.getTime()).toBe(
    at(2026, 10, 12),
  );
});

test('September includes every day from the 1st through the 30th without August or October', () => {
  const items = Array.from({ length: 30 }, (_, index) =>
    txn(at(2026, 9, index + 1, 12), index + 1),
  );
  const report = getInsights(
    [...items, txn(at(2026, 8, 31), 999), txn(at(2026, 10, 1), 999)],
    'month',
    at(2026, 9, 15),
  );
  expect(report.totalSpend).toBe(465);
  expect(report.bars.reduce((sum, bar) => sum + bar.value, 0)).toBe(465);
  expect(report.bars.map(bar => bar.label)).toEqual([
    '1–6',
    '7–13',
    '14–20',
    '21–27',
    '28–30',
  ]);
});

test.each([
  [2024, 29],
  [2025, 28],
])('February %s respects its %s days', (year, days) => {
  const period = getReportPeriod('month', at(year, 2, 15));
  expect(period.start.getTime()).toBe(at(year, 2, 1));
  expect(period.end.getTime()).toBe(at(year, 3, 1));
  const report = getInsights(
    [txn(at(year, 2, days, 23), 15), txn(at(year, 3, 1), 99)],
    'month',
    at(year, 2, 15),
  );
  expect(report.totalSpend).toBe(15);
  expect(report.bars.reduce((sum, bar) => sum + bar.value, 0)).toBe(15);
});

test('year reports cover January through December of the chosen year', () => {
  const items = [
    txn(at(2024, 12, 31), 99),
    txn(at(2025, 1, 1), 10),
    txn(at(2025, 12, 31, 23), 20),
    txn(at(2026, 1, 1), 30),
  ];
  const report = getInsights(items, 'year', at(2025, 8, 10));
  expect(report.periodLabel).toBe('2025');
  expect(report.totalSpend).toBe(30);
  expect(report.bars).toHaveLength(12);
  expect(report.bars[0].value).toBe(10);
  expect(report.bars[11].value).toBe(20);
  expect(getInsights(items, 'year', at(2026, 5, 1)).totalSpend).toBe(30);
});

test('comparisons use the previous calendar period even when month lengths differ', () => {
  const report = getInsights(
    [
      txn(at(2026, 8, 1), 100),
      txn(at(2026, 8, 31, 23), 100),
      txn(at(2026, 9, 1), 100),
    ],
    'month',
    at(2026, 9, 15),
  );
  expect(report.delta).toEqual({ pct: 50, isUp: false });
});

test('previous/next navigation handles month and year boundaries without date overflow', () => {
  expect(shiftReportPeriod('month', at(2026, 3, 31), -1)).toBe(at(2026, 2, 1));
  expect(shiftReportPeriod('month', at(2026, 1, 31), -1)).toBe(at(2025, 12, 1));
  expect(shiftReportPeriod('year', at(2026, 10, 7), -1)).toBe(at(2025, 1, 1));
  expect(shiftReportPeriod('week', at(2026, 1, 1), -1)).toBe(at(2025, 12, 22));
});
