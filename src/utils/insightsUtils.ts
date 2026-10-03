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

const DAY_MS = 24 * 60 * 60 * 1000;

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
      if (candidate.length >= 2 && !/\b(?:etb|birr|currency|amt)\b/i.test(candidate)) {
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

function bucketWithAge(
  transactions: Transaction[],
  bucketCount: number,
  daysPerBucket: number,
  labelFor: (index: number, day: Date) => string,
  now: number,
): InsightBar[] {
  const buckets: InsightBar[] = Array.from(
    { length: bucketCount },
    (_, index) => ({
      label: labelFor(
        index,
        new Date(now - (bucketCount - 1 - index) * daysPerBucket * DAY_MS),
      ),
      value: 0,
    }),
  );

  for (const item of transactions) {
    const stamp = parseStamp(item);
    if (stamp === 0 || item.type !== 'debit') {
      continue;
    }
    const ageDays = Math.floor((now - stamp) / DAY_MS);
    if (ageDays < 0) {
      continue;
    }
    const index = bucketCount - 1 - ageDays;
    if (index >= 0 && index < bucketCount) {
      buckets[index].value += item.amount;
    }
  }

  return buckets;
}

function bucketByMonth(transactions: Transaction[], now: number): InsightBar[] {
  const current = new Date(now);
  const buckets: InsightBar[] = Array.from({ length: 12 }, (_, index) => {
    const monthDate = new Date(
      current.getFullYear(),
      current.getMonth() - (11 - index),
      1,
    );
    return {
      label: monthDate.toLocaleDateString(getLocale(), { month: 'short' }),
      value: 0,
    };
  });

  const monthKey = (date: Date) =>
    `${date.getFullYear()}-${date.getMonth()}`;

  for (const item of transactions) {
    const stamp = parseStamp(item);
    if (stamp === 0 || item.type !== 'debit') {
      continue;
    }
    const date = new Date(stamp);
    const key = monthKey(date);
    const index = buckets.findIndex(
      (_, i) =>
        monthKey(
          new Date(current.getFullYear(), current.getMonth() - (11 - i), 1),
        ) === key,
    );
    if (index >= 0) {
      buckets[index].value += item.amount;
    }
  }

  return buckets;
}

const RANGE_CONFIG: Record<
  InsightRange,
  { days: number; periodLabel: string; barsTitle: string }
> = {
  week: { days: 7, periodLabel: 'This week', barsTitle: 'Spending by day' },
  month: { days: 30, periodLabel: 'This month', barsTitle: 'Spending by week' },
  year: { days: 365, periodLabel: 'This year', barsTitle: 'Spending by month' },
};

export function getInsights(
  transactions: Transaction[],
  range: InsightRange,
): Insights {
  const { days, periodLabel, barsTitle } = RANGE_CONFIG[range];
  const now = Date.now();
  const currentStart = now - days * DAY_MS;
  const previousStart = now - 2 * days * DAY_MS;

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
      if (stamp >= currentStart && stamp <= now) {
        currentItems.push(item);
        totalSpend += item.amount;
      } else if (stamp >= previousStart && stamp < currentStart) {
        previousSpend += item.amount;
      }
    } else if (stamp >= currentStart && stamp <= now) {
      totalIncome += item.amount;
    }
  }

  let bars: InsightBar[];
  if (range === 'year') {
    bars = bucketByMonth(currentItems, now);
  } else {
    bars = bucketWithAge(
      currentItems,
      range === 'week' ? 7 : 5,
      range === 'week' ? 1 : 6,
      (index, day) =>
        range === 'week'
          ? day.toLocaleDateString(getLocale(), { weekday: 'short' })
          : t('W{number}', { number: index + 1 }),
      now,
    );
  }

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

  const merchantMap = new Map<string, { amount: number; count: number; category: SpendCategory }>();
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