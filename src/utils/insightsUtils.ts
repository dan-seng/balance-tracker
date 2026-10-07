import { getLocale, t } from '../i18n';
import { Transaction } from '../models';
import { categorizeTransaction } from './categoryUtils';

export type InsightRange = 'week' | 'month' | 'year';

export type SpendCategory =
  | 'Transfers'
  | 'Bills & Utilities'
  | 'Food & Coffee'
  | 'Shopping'
  | 'Other';

export const SPEND_CATEGORY_COLORS: Record<SpendCategory, string> = {
  Transfers: '#0A84FF',
  'Bills & Utilities': '#FF9F0A',
  'Food & Coffee': '#30D158',
  Shopping: '#BF5AF2',
  Other: '#48484A',
};

export type InsightBar = { label: string; value: number };
export type CategoryShare = {
  name: SpendCategory;
  amount: number;
  pct: number;
};
export type MerchantShare = {
  name: string;
  category: SpendCategory;
  amount: number;
  count: number;
  pct: number;
};

export type Insights = {
  totalSpend: number;
  totalIncome: number;
  spentPct: number | null;
  delta: { pct: number; isUp: boolean } | null;
  periodLabel: string;
  barsTitle: string;
  bars: InsightBar[];
  maxBar: number;
  categories: CategoryShare[];
  merchants: MerchantShare[];
};

function titleCase(name: string): string {
  return name
    .replace(/[.,;:!?]+$/, '')
    .split(/\s+/)
    .filter(Boolean)
    .map(word =>
      word.length <= 2 && /^[a-z]+$/i.test(word)
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    )
    .join(' ');
}

export function extractMerchant(transaction: Transaction): string {
  const msg = transaction.rawSms || '';
  const trimmed = msg.trim();

  const patterns: RegExp[] = [
    /\bpaid\b[^]*?\bto\s+([A-Za-z][A-Za-z0-9 .&\-']{2,40})/,
    /\b(bought|purchased?|payment)\b[^]*?\b(?:at|from|to|on)\s+([A-Za-z][A-Za-z0-9 .&\-']{2,40})/,
    /\b(?:at|from)\s+([A-Za-z][A-Za-z0-9 .&\-']{2,40})/,
    /\bto\s+([A-Za-z][A-Za-z0-9 .&\-']{2,40})/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match) {
      const candidate = (match[1] ?? match[2] ?? match[3] ?? '').trim();
      if (
        candidate.length >= 2 &&
        !/\b(?:etb|birr|currency|amt)\b/i.test(candidate)
      ) {
        return titleCase(candidate);
      }
    }
  }

  if (transaction.sender && transaction.sender.trim()) {
    return titleCase(transaction.sender.trim());
  }

  return t('Unknown');
}

export function classifySpend(transaction: Transaction): SpendCategory {
  const category = categorizeTransaction(transaction);

  if (category === 'Transfer' || category === 'Withdrawal') {
    return 'Transfers';
  }
  if (category === 'Deposit' || category === 'Received') {
    return 'Other';
  }

  const msg = transaction.rawSms.toLowerCase();

  if (
    /\b(food|caf[eé]|restaurant|pizza|burger|coffee|juice|lunch|dinner|kfc|starbucks|sandwich|milk|mocha)\b/.test(
      msg,
    )
  ) {
    return 'Food & Coffee';
  }

  if (
    /\b(electric|water|internet|utility|bill|recharge|token|telecom|ethio telecom|university|tuition|school|cinema)\b/.test(
      msg,
    ) ||
    /\btelebirr\b/.test(msg)
  ) {
    return 'Bills & Utilities';
  }

  if (
    /\b(shop|store|supermarket|mall|market|pharmacy|drugstore|amazon|sneaker|clothes|gadget|furniture)\b/.test(
      msg,
    )
  ) {
    return 'Shopping';
  }

  return 'Other';
}

function parseStamp(transaction: Transaction): number {
  const timestamp = Date.parse(transaction.date);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

export function getReportPeriod(range: InsightRange, reference = Date.now()) {
  const date = new Date(reference);
  let start: Date;
  let end: Date;
  let previousStart: Date;
  if (range === 'week') {
    start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
    end = new Date(start);
    end.setDate(end.getDate() + 7);
    previousStart = new Date(start);
    previousStart.setDate(previousStart.getDate() - 7);
  } else if (range === 'month') {
    start = new Date(date.getFullYear(), date.getMonth(), 1);
    end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    previousStart = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  } else {
    start = new Date(date.getFullYear(), 0, 1);
    end = new Date(date.getFullYear() + 1, 0, 1);
    previousStart = new Date(date.getFullYear() - 1, 0, 1);
  }
  return { start, end, previousStart };
}

export function shiftReportPeriod(
  range: InsightRange,
  reference: number,
  direction: number,
): number {
  const { start } = getReportPeriod(range, reference);
  if (range === 'week') start.setDate(start.getDate() + direction * 7);
  else if (range === 'month') start.setMonth(start.getMonth() + direction);
  else start.setFullYear(start.getFullYear() + direction);
  return start.getTime();
}

function calendarBars(
  transactions: Transaction[],
  range: InsightRange,
  start: Date,
  end: Date,
): InsightBar[] {
  const intervals: { start: Date; end: Date; label: string }[] = [];
  let cursor = new Date(start);
  while (cursor < end) {
    let next: Date;
    let label: string;
    if (range === 'year') {
      next = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
      label = cursor.toLocaleDateString(getLocale(), { month: 'short' });
    } else {
      next = new Date(cursor);
      next.setDate(
        next.getDate() +
          (range === 'week' ? 1 : 7 - ((cursor.getDay() + 6) % 7)),
      );
      if (next > end) next = new Date(end);
      const last = new Date(next);
      last.setDate(last.getDate() - 1);
      label =
        range === 'week'
          ? cursor.toLocaleDateString(getLocale(), { weekday: 'short' })
          : cursor.getDate() === last.getDate()
          ? String(cursor.getDate())
          : `${cursor.getDate()}–${last.getDate()}`;
    }
    intervals.push({ start: cursor, end: next, label });
    cursor = next;
  }
  return intervals.map(interval => ({
    label: interval.label,
    value: transactions.reduce((sum, item) => {
      const stamp = parseStamp(item);
      return stamp >= interval.start.getTime() && stamp < interval.end.getTime()
        ? sum + item.amount
        : sum;
    }, 0),
  }));
}

export function getInsights(
  transactions: Transaction[],
  range: InsightRange,
  reference = Date.now(),
): Insights {
  const {
    start,
    end,
    previousStart: previousDate,
  } = getReportPeriod(range, reference);
  const currentStart = start.getTime();
  const currentEnd = end.getTime();
  const previousStart = previousDate.getTime();
  const last = new Date(end);
  last.setDate(last.getDate() - 1);
  const dateOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };
  const periodLabel =
    range === 'year'
      ? start.toLocaleDateString(getLocale(), { year: 'numeric' })
      : range === 'month'
      ? start.toLocaleDateString(getLocale(), {
          month: 'long',
          year: 'numeric',
        })
      : `${start.toLocaleDateString(
          getLocale(),
          dateOptions,
        )} – ${last.toLocaleDateString(getLocale(), dateOptions)}`;
  const barsTitle =
    range === 'year'
      ? 'Spending by month'
      : range === 'month'
      ? 'Spending by week'
      : 'Spending by day';

  const currentItems: Transaction[] = [];
  let totalIncome = 0;
  let totalSpend = 0;
  let previousSpend = 0;

  for (const item of transactions) {
    const stamp = parseStamp(item);
    if (stamp === 0) {
      continue;
    }

    if (item.type === 'debit') {
      if (stamp >= currentStart && stamp < currentEnd) {
        currentItems.push(item);
        totalSpend += item.amount;
      } else if (stamp >= previousStart && stamp < currentStart) {
        previousSpend += item.amount;
      }
    } else if (stamp >= currentStart && stamp < currentEnd) {
      totalIncome += item.amount;
    }
  }

  const bars = calendarBars(currentItems, range, start, end);

  const maxBar = bars.reduce((max, bar) => Math.max(max, bar.value), 0);

  const catMap = new Map<SpendCategory, number>();
  for (const item of currentItems) {
    const category = classifySpend(item);
    catMap.set(category, (catMap.get(category) ?? 0) + item.amount);
  }

  const categories: CategoryShare[] = Array.from(catMap.entries())
    .map(([name, amount]) => ({
      name,
      amount,
      pct: totalSpend > 0 ? (amount / totalSpend) * 100 : 0,
    }))
    .sort((left, right) => right.amount - left.amount);

  const merchantMap = new Map<
    string,
    { amount: number; count: number; category: SpendCategory }
  >();
  for (const item of currentItems) {
    const name = extractMerchant(item);
    const entry = merchantMap.get(name) ?? {
      amount: 0,
      count: 0,
      category: classifySpend(item),
    };
    entry.amount += item.amount;
    entry.count += 1;
    merchantMap.set(name, entry);
  }

  const merchants: MerchantShare[] = Array.from(merchantMap.entries())
    .map(([name, { amount, count, category }]) => ({
      name,
      category,
      amount,
      count,
      pct: totalSpend > 0 ? (amount / totalSpend) * 100 : 0,
    }))
    .sort((left, right) => right.amount - left.amount)
    .slice(0, 6);

  let delta: Insights['delta'] = null;
  if (previousSpend > 0) {
    const pct = Math.abs(
      Math.round(((totalSpend - previousSpend) / previousSpend) * 100),
    );
    delta = {
      pct,
      isUp: totalSpend > previousSpend,
    };
  }

  return {
    totalSpend,
    totalIncome,
    spentPct:
      totalIncome > 0 ? Math.min((totalSpend / totalIncome) * 100, 100) : null,
    delta,
    periodLabel,
    barsTitle,
    bars,
    maxBar,
    categories,
    merchants,
  };
}
