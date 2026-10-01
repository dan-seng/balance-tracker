import { EMPTY_SHOP, ShopData, ShopProduct } from '../src/models/shop';
import {
  parseMoney,
  parseQuantity,
  prepareSale,
  remaining,
  shopTotals,
  weightedCost,
} from '../src/utils/shopUtils';
const product: ShopProduct = {
  id: 'p',
  name: 'Coffee',
  unit: 'packs',
  quantity: 10,
  costCents: 5000,
  priceCents: 8000,
  lowStock: 2,
};
const now = new Date(2026, 9, 2, 15);
const yesterday = new Date(2026, 9, 1, 15).toISOString();
const today = new Date(2026, 9, 2, 12).toISOString();
function ledger(): ShopData {
  return {
    ...EMPTY_SHOP,
    products: [{ ...product }],
    sales: [
      {
        id: 's',
        date: yesterday,
        customerId: 'c',
        totalCents: 16000,
        costCents: 10000,
      },
    ],
    payments: [
      {
        id: 'initial',
        saleId: 's',
        date: yesterday,
        amountCents: 6000,
        kind: 'sale',
      },
      {
        id: 'repay',
        saleId: 's',
        date: today,
        amountCents: 3000,
        kind: 'repayment',
      },
    ],
    expenses: [
      {
        id: 'e',
        date: today,
        description: 'Rent',
        category: 'Rent',
        amountCents: 2000,
      },
    ],
  };
}
describe('shop accounting', () => {
  test('parses santim exactly and rejects invalid amounts', () => {
    expect(parseMoney('12.01')).toBe(1201);
    expect(parseMoney('0.1')).toBe(10);
    for (const value of [
      '-1',
      '12.001',
      '1e3',
      'Infinity',
      '',
      '12abc',
      '1,000',
    ])
      expect(() => parseMoney(value)).toThrow();
    expect(() => parseQuantity('1.5')).toThrow();
    expect(() => parseQuantity('-1')).toThrow();
  });
  test('sales capture cost and selling price independently', () => {
    const sale = prepareSale(
      [product],
      [{ productId: 'p', quantity: 2, priceCents: 7500 }],
    );
    expect(sale.totalCents).toBe(15000);
    expect(sale.costCents).toBe(10000);
    product.costCents = 6000;
    expect(sale.lines[0].costCents).toBe(5000);
    product.costCents = 5000;
  });
  test('prevents missing products, duplicate lines, insufficient stock and zero quantities', () => {
    for (const inputs of [
      [],
      [{ productId: 'missing', quantity: 1, priceCents: 8000 }],
      [{ productId: 'p', quantity: 11, priceCents: 8000 }],
      [{ productId: 'p', quantity: 0, priceCents: 8000 }],
      [
        { productId: 'p', quantity: 1, priceCents: 8000 },
        { productId: 'p', quantity: 1, priceCents: 8000 },
      ],
    ])
      expect(() => prepareSale([product], inputs)).toThrow();
  });
  test('restock uses weighted average, rounded to the nearest santim', () => {
    expect(weightedCost(product, 10, 7000)).toBe(6000);
    expect(
      weightedCost({ ...product, quantity: 2, costCents: 100 }, 1, 102),
    ).toBe(101);
  });
  test('a repayment changes collections and debt without creating revenue or profit', () => {
    const data = ledger();
    const totals = shopTotals(data, 'today', now);
    expect(totals.salesCents).toBe(0);
    expect(totals.collectedCents).toBe(3000);
    expect(totals.profitCents).toBe(-2000);
    expect(totals.outstandingCents).toBe(7000);
    expect(remaining(data.sales[0], data)).toBe(7000);
    const all = shopTotals(data, 'all', now);
    expect(all.salesCents).toBe(16000);
    expect(all.profitCents).toBe(4000);
  });
  test('unsold purchases do not count as operating expenses', () => {
    const data = {
      ...EMPTY_SHOP,
      products: [product],
      movements: [
        {
          id: 'm',
          date: today,
          productId: 'p',
          kind: 'restock' as const,
          quantity: 10,
          amountCents: 50000,
        },
      ],
    };
    const totals = shopTotals(data, 'today', now);
    expect(totals.profitCents).toBe(0);
    expect(totals.stockValueCents).toBe(50000);
  });
  test('reporting periods use local calendar boundaries', () => {
    const data = ledger();
    data.expenses.push({
      id: 'old',
      date: new Date(2026, 8, 30, 23).toISOString(),
      description: 'Old',
      category: 'Other',
      amountCents: 100,
    });
    expect(shopTotals(data, 'month', now).expenseCents).toBe(2000);
  });
});
