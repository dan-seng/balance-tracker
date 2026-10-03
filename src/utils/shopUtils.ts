import { getLocale } from '../i18n';
import { t } from '../i18n';
import { SaleInput, ShopData, ShopProduct, ShopSale } from '../models/shop';

// Integer santim keeps input, payments and accounting totals exact.
export function parseMoney(value: string): number {
  const text = value.trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(text))
    throw new Error(t('Enter an ETB amount with up to two decimal places.'));
  const [whole, fraction = ''] = text.split('.');
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  assertMoney(cents);
  return cents;
}
export function assertMoney(value: number) {
  if (!Number.isSafeInteger(value) || value < 0 || value > 100000000000)
    throw new Error(t('Enter an amount between 0 and 1,000,000,000 ETB.'));
}
export function parseQuantity(value: string): number {
  if (!/^\d+$/.test(value.trim()))
    throw new Error(t('Enter a whole number of units.'));
  const quantity = Number(value);
  if (!Number.isSafeInteger(quantity) || quantity < 0 || quantity > 1000000)
    throw new Error(t('Quantity must be between 0 and 1,000,000.'));
  return quantity;
}
export function money(cents: number): string {
  return `${t('ETB')} ${(cents / 100).toLocaleString(getLocale(), {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
export function remaining(sale: ShopSale, data: ShopData): number {
  return (
    sale.totalCents -
    data.payments
      .filter(p => p.saleId === sale.id)
      .reduce((sum, p) => sum + p.amountCents, 0)
  );
}
export function weightedCost(
  product: ShopProduct,
  quantity: number,
  unitCost: number,
): number {
  const value = product.quantity * product.costCents + quantity * unitCost;
  assertMoney(value);
  return Math.round(value / (product.quantity + quantity));
}
export function prepareSale(products: ShopProduct[], inputs: SaleInput[]) {
  if (!inputs.length)
    throw new Error(t('Add at least one product to the sale.'));
  const seen = new Set<string>();
  const lines = inputs.map(input => {
    if (seen.has(input.productId))
      throw new Error(t('Use one line per product.'));
    seen.add(input.productId);
    const product = products.find(p => p.id === input.productId);
    if (!product) throw new Error(t('This product is no longer available.'));
    if (
      !Number.isInteger(input.quantity) ||
      input.quantity <= 0 ||
      input.quantity > product.quantity
    )
      throw new Error(
        t('Not enough stock for {name}. Available: {quantity} {unit}.', {
          name: product.name,
          quantity: product.quantity,
          unit: product.unit,
        }),
      );
    assertMoney(input.priceCents);
    return {
      ...input,
      name: product.name,
      unit: product.unit,
      costCents: product.costCents,
    };
  });
  const totalCents = lines.reduce(
    (sum, line) => sum + line.quantity * line.priceCents,
    0,
  );
  const costCents = lines.reduce(
    (sum, line) => sum + line.quantity * line.costCents,
    0,
  );
  assertMoney(totalCents);
  assertMoney(costCents);
  if (!totalCents)
    throw new Error(t('The sale total must be greater than zero.'));
  return { lines, totalCents, costCents };
}
export type ShopPeriod = 'today' | 'month' | 'all';
export function shopTotals(
  data: ShopData,
  period: ShopPeriod,
  now = new Date(),
) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  if (period === 'month') start.setDate(1);
  const within = (date: string) =>
    period === 'all' ||
    (Date.parse(date) >= start.getTime() && Date.parse(date) <= now.getTime());
  const sales = data.sales.filter(s => within(s.date));
  const salesCents = sales.reduce((sum, s) => sum + s.totalCents, 0);
  const costCents = sales.reduce((sum, s) => sum + s.costCents, 0);
  const expenseCents = data.expenses
    .filter(e => within(e.date))
    .reduce((sum, e) => sum + e.amountCents, 0);
  const collectedCents = data.payments
    .filter(p => within(p.date))
    .reduce((sum, p) => sum + p.amountCents, 0);
  const outstandingCents = data.sales.reduce(
    (sum, s) => sum + remaining(s, data),
    0,
  );
  const stockValueCents = data.products.reduce(
    (sum, p) => sum + p.quantity * p.costCents,
    0,
  );
  return {
    salesCents,
    costCents,
    expenseCents,
    collectedCents,
    outstandingCents,
    stockValueCents,
    profitCents: salesCents - costCents - expenseCents,
  };
}
