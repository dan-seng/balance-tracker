import { t } from '../i18n';
import SQLite from './sqliteRuntime';
import {
  EMPTY_SHOP,
  SaleInput,
  ShopCustomer,
  ShopData,
  ShopExpense,
  ShopMovement,
  ShopPayment,
  ShopProduct,
  ShopSale,
  ShopSaleLine,
} from '../models/shop';
import {
  assertMoney,
  parseQuantity,
  prepareSale,
  remaining,
  weightedCost,
} from '../utils/shopUtils';

// Separate database: rebuilding the SMS inbox cannot erase the owner's ledger.
type Statement = [string, (string | number | null)[]];
type ShopDatabase = SQLite.SQLiteDatabase & {
  sqlBatch(statements: Statement[]): Promise<void>;
};
let connection: Promise<ShopDatabase> | null = null;
let pending: Promise<unknown> = Promise.resolve();
function exclusive<T>(operation: () => Promise<T>): Promise<T> {
  const next = pending.then(operation);
  pending = next.catch(() => undefined);
  return next;
}
const id = () => `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
const stamp = () => new Date().toISOString();
function text(value: string, label: string): string {
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 120)
    throw new Error(t('{label} must contain 1–120 characters.', { label }));
  return trimmed;
}
async function database(): Promise<ShopDatabase> {
  if (!connection) {
    connection = (async () => {
      const db = (await SQLite.openDatabase({
        name: 'HisabShop.db',
        location: 'default',
      })) as ShopDatabase;
      await db.sqlBatch([
        [
          'CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY, name TEXT NOT NULL, unit TEXT NOT NULL, quantity INTEGER NOT NULL CHECK(quantity >= 0), costCents INTEGER NOT NULL, priceCents INTEGER NOT NULL, lowStock INTEGER NOT NULL)',
          [],
        ],
        [
          'CREATE TABLE IF NOT EXISTS customers (id TEXT PRIMARY KEY, name TEXT NOT NULL, phone TEXT NOT NULL)',
          [],
        ],
        [
          'CREATE TABLE IF NOT EXISTS sales (id TEXT PRIMARY KEY, customerId TEXT, date TEXT NOT NULL, totalCents INTEGER NOT NULL, costCents INTEGER NOT NULL)',
          [],
        ],
        [
          'CREATE TABLE IF NOT EXISTS lines (id TEXT PRIMARY KEY, saleId TEXT NOT NULL, productId TEXT NOT NULL, name TEXT NOT NULL, unit TEXT NOT NULL, quantity INTEGER NOT NULL, priceCents INTEGER NOT NULL, costCents INTEGER NOT NULL)',
          [],
        ],
        [
          'CREATE TABLE IF NOT EXISTS payments (id TEXT PRIMARY KEY, saleId TEXT NOT NULL, date TEXT NOT NULL, amountCents INTEGER NOT NULL CHECK(amountCents > 0), kind TEXT NOT NULL)',
          [],
        ],
        [
          'CREATE TABLE IF NOT EXISTS expenses (id TEXT PRIMARY KEY, date TEXT NOT NULL, description TEXT NOT NULL, category TEXT NOT NULL, amountCents INTEGER NOT NULL)',
          [],
        ],
        [
          'CREATE TABLE IF NOT EXISTS movements (id TEXT PRIMARY KEY, productId TEXT NOT NULL, date TEXT NOT NULL, kind TEXT NOT NULL, quantity INTEGER NOT NULL, amountCents INTEGER NOT NULL)',
          [],
        ],
        [
          'CREATE INDEX IF NOT EXISTS shop_payment_sale ON payments(saleId)',
          [],
        ],
        ['CREATE INDEX IF NOT EXISTS shop_line_sale ON lines(saleId)', []],
      ]);
      return db;
    })().catch(error => {
      connection = null;
      throw error;
    });
  }
  return connection;
}
async function rows<T>(db: ShopDatabase, table: string): Promise<T[]> {
  const [result] = await db.executeSql(`SELECT * FROM ${table}`);
  return Array.from(
    { length: result.rows.length },
    (_, index) => result.rows.item(index) as T,
  );
}
async function read(): Promise<ShopData> {
  const db = await database();
  const [products, customers, sales, lines, payments, expenses, movements] =
    await Promise.all([
      rows<ShopProduct>(db, 'products'),
      rows<ShopCustomer>(db, 'customers'),
      rows<ShopSale>(db, 'sales'),
      rows<ShopSaleLine>(db, 'lines'),
      rows<ShopPayment>(db, 'payments'),
      rows<ShopExpense>(db, 'expenses'),
      rows<ShopMovement>(db, 'movements'),
    ]);
  return {
    ...EMPTY_SHOP,
    products,
    customers,
    sales,
    lines,
    payments,
    expenses,
    movements,
  };
}
export function loadShop(): Promise<ShopData> {
  return exclusive(read);
}
export function addProduct(input: Omit<ShopProduct, 'id'>): Promise<void> {
  return exclusive(async () => {
    const name = text(input.name, t('Product name'));
    const unit = text(input.unit, t('Unit'));
    parseQuantity(String(input.quantity));
    parseQuantity(String(input.lowStock));
    assertMoney(input.costCents);
    assertMoney(input.priceCents);
    assertMoney(input.quantity * input.costCents);
    const productId = id();
    const date = stamp();
    const db = await database();
    await db.sqlBatch([
      [
        'INSERT INTO products VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          productId,
          name,
          unit,
          input.quantity,
          input.costCents,
          input.priceCents,
          input.lowStock,
        ],
      ],
      [
        'INSERT INTO movements VALUES (?, ?, ?, ?, ?, ?)',
        [
          id(),
          productId,
          date,
          'opening',
          input.quantity,
          input.quantity * input.costCents,
        ],
      ],
    ]);
  });
}
export function addCustomer(name: string, phone: string): Promise<string> {
  return exclusive(async () => {
    const db = await database();
    if (phone.trim().length > 40)
      throw new Error(t('Phone number is too long.'));
    const customerId = id();
    await db.executeSql('INSERT INTO customers VALUES (?, ?, ?)', [
      customerId,
      text(name, t('Customer name')),
      phone.trim(),
    ]);
    return customerId;
  });
}
export function restockProduct(
  productId: string,
  quantity: number,
  costCents: number,
): Promise<void> {
  return exclusive(async () => {
    parseQuantity(String(quantity));
    assertMoney(costCents);
    if (quantity === 0)
      throw new Error(t('Restock quantity must be greater than zero.'));
    const data = await read();
    const product = data.products.find(p => p.id === productId);
    if (!product) throw new Error(t('Select a product.'));
    parseQuantity(String(product.quantity + quantity));
    const newCost = weightedCost(product, quantity, costCents);
    const db = await database();
    await db.sqlBatch([
      [
        'UPDATE products SET quantity = ?, costCents = ? WHERE id = ?',
        [product.quantity + quantity, newCost, productId],
      ],
      [
        'INSERT INTO movements VALUES (?, ?, ?, ?, ?, ?)',
        [id(), productId, stamp(), 'restock', quantity, quantity * costCents],
      ],
    ]);
  });
}
export function recordSale(
  inputs: SaleInput[],
  receivedCents: number,
  customerId: string | null,
): Promise<void> {
  return exclusive(async () => {
    const data = await read();
    const prepared = prepareSale(data.products, inputs);
    assertMoney(receivedCents);
    if (receivedCents > prepared.totalCents)
      throw new Error(t('Amount received cannot exceed the sale total.'));
    if (customerId && !data.customers.some(c => c.id === customerId))
      throw new Error(t('Select an existing customer.'));
    if (receivedCents < prepared.totalCents && !customerId)
      throw new Error(t('Choose a customer for an unpaid sale.'));
    const saleId = id();
    const date = stamp();
    const statements: Statement[] = [
      [
        'INSERT INTO sales VALUES (?, ?, ?, ?, ?)',
        [saleId, customerId, date, prepared.totalCents, prepared.costCents],
      ],
    ];
    for (const line of prepared.lines) {
      statements.push([
        'INSERT INTO lines VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          id(),
          saleId,
          line.productId,
          line.name,
          line.unit,
          line.quantity,
          line.priceCents,
          line.costCents,
        ],
      ]);
      statements.push([
        'UPDATE products SET quantity = quantity - ? WHERE id = ?',
        [line.quantity, line.productId],
      ]);
      statements.push([
        'INSERT INTO movements VALUES (?, ?, ?, ?, ?, ?)',
        [
          id(),
          line.productId,
          date,
          'sale',
          -line.quantity,
          line.quantity * line.costCents,
        ],
      ]);
    }
    if (receivedCents > 0)
      statements.push([
        'INSERT INTO payments VALUES (?, ?, ?, ?, ?)',
        [id(), saleId, date, receivedCents, 'sale'],
      ]);
    const db = await database();
    await db.sqlBatch(statements);
  });
}
export function addExpense(
  description: string,
  category: string,
  amountCents: number,
): Promise<void> {
  return exclusive(async () => {
    assertMoney(amountCents);
    if (!amountCents)
      throw new Error(t('Expense amount must be greater than zero.'));
    const db = await database();
    await db.executeSql('INSERT INTO expenses VALUES (?, ?, ?, ?, ?)', [
      id(),
      stamp(),
      text(description, t('Description')),
      text(category, t('Category')),
      amountCents,
    ]);
  });
}
export function recordRepayment(
  saleId: string,
  amountCents: number,
): Promise<void> {
  return exclusive(async () => {
    assertMoney(amountCents);
    const data = await read();
    const sale = data.sales.find(s => s.id === saleId);
    if (!sale || amountCents <= 0 || amountCents > remaining(sale, data))
      throw new Error(
        t(
          'Enter a repayment greater than zero and no more than the unpaid balance.',
        ),
      );
    const db = await database();
    await db.executeSql('INSERT INTO payments VALUES (?, ?, ?, ?, ?)', [
      id(),
      saleId,
      stamp(),
      amountCents,
      'repayment',
    ]);
  });
}
export function editProduct(
  productId: string,
  name: string,
  unit: string,
  priceCents: number,
  lowStock: number,
): Promise<void> {
  return exclusive(async () => {
    assertMoney(priceCents);
    parseQuantity(String(lowStock));
    const db = await database();
    await db.executeSql(
      'UPDATE products SET name = ?, unit = ?, priceCents = ?, lowStock = ? WHERE id = ?',
      [
        text(name, t('Product name')),
        text(unit, t('Unit')),
        priceCents,
        lowStock,
        productId,
      ],
    );
  });
}
