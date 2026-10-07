const { mkdtempSync, rmSync } = require('fs');
const { tmpdir } = require('os');
const { join } = require('path');
import {
  money,
  remaining,
  shopTotals,
  supplierOwed,
} from '../src/utils/shopUtils';
let mockDbPath = '';
let directory = '';
jest.setTimeout(30000);
// Run the actual statements against SQLite; only the Android transport is replaced.
jest.mock('react-native-sqlite-storage', () => ({
  enablePromise: jest.fn(),
  openDatabase: async () => {
    const run = (statements: unknown[]) => {
      const { spawnSync } = require('child_process');
      const result = spawnSync(
        'python3',
        [
          '-c',
          `
import sys, json, sqlite3
with sqlite3.connect(sys.argv[1]) as db:
    db.row_factory = sqlite3.Row
    results = []
    for sql, params in json.loads(sys.argv[2]):
        cursor = db.execute(sql, params)
        results.append([dict(row) for row in cursor.fetchall()] if cursor.description else [])
    print(json.dumps(results))
`,
          mockDbPath,
          JSON.stringify(statements),
        ],
        { encoding: 'utf8', timeout: 10000 },
      );
      if (result.status !== 0) throw new Error(result.stderr);
      return JSON.parse(result.stdout);
    };
    return {
      sqlBatch: async (statements: unknown[]) => {
        run(statements);
      },
      executeSql: async (sql: string, params: unknown[] = []) => {
        const items = run([[sql, params]])[0];
        return [
          {
            rows: {
              length: items.length,
              item: (index: number) => items[index],
            },
          },
        ];
      },
    };
  },
}));
import {
  addCustomer,
  recordReturn,
  correctStock,
  addSupplier,
  purchaseStock,
  paySupplier,
  addExpense,
  addProduct,
  editProduct,
  loadShop,
  recordRepayment,
  recordSale,
  restockProduct,
} from '../src/db/shopDatabase';

beforeAll(() => {
  directory = mkdtempSync(join(tmpdir(), 'hisab-shop-test-'));
  mockDbPath = join(directory, 'shop.db');
});
afterAll(() => {
  rmSync(directory, { recursive: true, force: true });
});
test('persists an entire shop lifecycle with stock, historical costs, credit and repayments', async () => {
  await addProduct({
    name: 'Coffee',
    unit: 'packs',
    quantity: 10,
    costCents: 5000,
    priceCents: 8000,
    lowStock: 2,
  });
  await addCustomer('Abebe', '0912345678');
  let data = await loadShop();
  const productId = data.products[0].id;
  const customerId = data.customers[0].id;
  await recordSale(
    [{ productId, quantity: 2, priceCents: 8000 }],
    6000,
    customerId,
  );
  data = await loadShop();
  const saleId = data.sales[0].id;
  expect(data.products[0].quantity).toBe(8);
  expect(remaining(data.sales[0], data)).toBe(10000);
  await restockProduct(productId, 8, 7000);
  await editProduct(productId, 'Coffee beans', 'packs', 9000, 3);
  await addExpense('Transport', 'Transport', 1000);
  await recordRepayment(saleId, 3000);
  data = await loadShop();
  expect(data.products[0].quantity).toBe(16);
  expect(data.products[0].costCents).toBe(6000);
  expect(data.lines[0].name).toBe('Coffee');
  expect(data.lines[0].costCents).toBe(5000);
  expect(remaining(data.sales[0], data)).toBe(7000);
  const totals = shopTotals(data, 'all');
  expect(money(totals.profitCents)).toContain('50.00');
  expect(totals.salesCents).toBe(16000);
  expect(totals.collectedCents).toBe(9000);
  // A new native connection to the same on-disk database sees the saved records.
  const SQLite = require('react-native-sqlite-storage');
  const freshDb = await SQLite.openDatabase({ name: 'HisabShop.db' });
  const [result] = await freshDb.executeSql('SELECT * FROM sales');
  expect(result.rows.item(0).id).toBe(saleId);
  await expect(recordRepayment(saleId, 7001)).rejects.toThrow();
  await expect(
    recordSale([{ productId, quantity: 1, priceCents: 9000 }], 0, null),
  ).rejects.toThrow('Choose a customer');
  await expect(
    recordSale([{ productId, quantity: 1, priceCents: 9000 }], 10000, null),
  ).rejects.toThrow('cannot exceed');
  await expect(restockProduct(productId, 0, 7000)).rejects.toThrow();
  expect((await loadShop()).sales).toHaveLength(1);
  // Concurrent callers cannot both spend the last units.
  const results = await Promise.allSettled([
    recordSale([{ productId, quantity: 16, priceCents: 9000 }], 144000, null),
    recordSale([{ productId, quantity: 16, priceCents: 9000 }], 144000, null),
  ]);
  expect(results.filter(r => r.status === 'fulfilled')).toHaveLength(1);
  expect((await loadShop()).products[0].quantity).toBe(0);
});

test('partial and damaged returns handle debt, refunds, stock and historical costs without double counting', async () => {
  const baseline = shopTotals(await loadShop(), 'all');
  await addProduct({
    name: 'Return item',
    unit: 'pieces',
    quantity: 5,
    costCents: 10000,
    priceCents: 15000,
    lowStock: 1,
  });
  const customerId = await addCustomer('Return customer', '');
  let data = await loadShop();
  const product = data.products.find(p => p.name === 'Return item')!;
  await recordSale(
    [{ productId: product.id, quantity: 2, priceCents: 15000 }],
    10000,
    customerId,
  );
  data = await loadShop();
  const sale = data.sales.find(s => s.customerId === customerId)!;
  const line = data.lines.find(l => l.saleId === sale.id)!;
  await recordReturn(line.id, 1, true);
  data = await loadShop();
  expect(remaining(sale, data)).toBe(5000);
  expect(data.returns!.find(r => r.lineId === line.id)!.refundCents).toBe(0);
  expect(data.products.find(p => p.id === product.id)!.quantity).toBe(4);
  await recordReturn(line.id, 1, false);
  data = await loadShop();
  expect(remaining(sale, data)).toBe(0);
  expect(
    data
      .returns!.filter(r => r.lineId === line.id)
      .reduce((sum, r) => sum + r.refundCents, 0),
  ).toBe(10000);
  expect(data.products.find(p => p.id === product.id)!.quantity).toBe(4);
  expect(shopTotals(data, 'all').profitCents - baseline.profitCents).toBe(
    -10000,
  );
  expect(shopTotals(data, 'all').collectedCents - baseline.collectedCents).toBe(
    0,
  );
  await expect(recordReturn(line.id, 1, true)).rejects.toThrow(
    'Return quantity',
  );
  await expect(recordRepayment(sale.id, 1)).rejects.toThrow();
});

test('stock corrections keep an audit trail and record missing inventory as a loss', async () => {
  await addProduct({
    name: 'Damage item',
    unit: 'pieces',
    quantity: 5,
    costCents: 1000,
    priceCents: 2000,
    lowStock: 1,
  });
  const initial = await loadShop();
  const product = initial.products.find(p => p.name === 'Damage item')!;
  await correctStock(product.id, 3, 'Two broken');
  await correctStock(product.id, 6, 'Found three more');
  const data = await loadShop();
  expect(data.products.find(p => p.id === product.id)!.quantity).toBe(6);
  expect(
    data
      .adjustments!.filter(a => a.productId === product.id)
      .map(a => a.quantityDelta),
  ).toEqual([-2, 3]);
  expect(
    shopTotals(data, 'all').expenseCents -
      shopTotals(initial, 'all').expenseCents,
  ).toBe(2000);
  await expect(correctStock(product.id, -1, 'Invalid')).rejects.toThrow();
});

test('supplier credit adds stock, tracks payments and never counts purchases as operating expenses', async () => {
  await addSupplier('Credit supplier', '');
  await addProduct({
    name: 'Supplier item',
    unit: 'pieces',
    quantity: 0,
    costCents: 0,
    priceCents: 20000,
    lowStock: 1,
  });
  const initial = await loadShop();
  const supplier = initial.suppliers!.find(s => s.name === 'Credit supplier')!;
  const product = initial.products.find(p => p.name === 'Supplier item')!;
  await purchaseStock(supplier.id, product.id, 4, 10000, 10000);
  let data = await loadShop();
  const purchase = data.purchases!.find(p => p.supplierId === supplier.id)!;
  expect(supplierOwed(data, purchase.id)).toBe(30000);
  expect(data.products.find(p => p.id === product.id)!.quantity).toBe(4);
  expect(data.products.find(p => p.id === product.id)!.costCents).toBe(10000);
  await paySupplier(purchase.id, 20000);
  data = await loadShop();
  expect(supplierOwed(data, purchase.id)).toBe(10000);
  expect(shopTotals(data, 'all').profitCents).toBe(
    shopTotals(initial, 'all').profitCents,
  );
  await expect(paySupplier(purchase.id, 10001)).rejects.toThrow('Payment');
});
