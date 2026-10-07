import { EMPTY_SHOP, ShopData } from '../src/models/shop';
import { customerStatement, dailyClosing } from '../src/utils/shopReports';
const data: ShopData = {
  ...EMPTY_SHOP,
  customers: [{ id: 'c', name: 'Abebe', phone: '' }],
  sales: [
    {
      id: 's',
      customerId: 'c',
      date: '2025-09-15T10:00:00.000Z',
      totalCents: 30000,
      costCents: 20000,
    },
  ],
  lines: [
    {
      id: 'l',
      saleId: 's',
      productId: 'p',
      name: 'Coffee',
      unit: 'packs',
      quantity: 2,
      priceCents: 15000,
      costCents: 10000,
    },
  ],
  payments: [
    {
      id: 'pay',
      saleId: 's',
      date: '2025-09-15T10:00:00.000Z',
      amountCents: 10000,
      kind: 'sale',
    },
  ],
  returns: [
    {
      id: 'r',
      saleId: 's',
      lineId: 'l',
      date: '2025-09-15T11:00:00.000Z',
      quantity: 1,
      amountCents: 15000,
      costCents: 10000,
      refundCents: 0,
      restocked: 1,
    },
  ],
};
test('daily closing shows net sales, costs, profit and collections for the selected day', () => {
  const report = dailyClosing(data, '2025-09-15');
  expect(report).toContain('Sales after returns: ETB 150.00');
  expect(report).toContain('Profit / loss: ETB 50.00');
  expect(report).toContain('Money received after refunds: ETB 100.00');
  expect(dailyClosing(data, '2025-09-16')).toContain(
    'Sales after returns: ETB 0.00',
  );
  expect(() => dailyClosing(data, '2025-02-30')).toThrow();
});
test('customer statements include purchases, payments, returns and the correct debt', () => {
  const report = customerStatement(data, 'c');
  expect(report).toContain('Abebe');
  expect(report).toContain('Coffee × 2');
  expect(report).toContain('Payment: ETB 100.00');
  expect(report).toContain('Return: ETB 150.00');
  expect(report).toContain('Current amount owed: ETB 50.00');
});
