export type ShopProduct = {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  costCents: number;
  priceCents: number;
  lowStock: number;
};
export type ShopCustomer = { id: string; name: string; phone: string };
export type ShopSale = {
  id: string;
  customerId: string | null;
  date: string;
  totalCents: number;
  costCents: number;
};
export type ShopSaleLine = {
  id: string;
  saleId: string;
  productId: string;
  name: string;
  unit: string;
  quantity: number;
  priceCents: number;
  costCents: number;
};
export type ShopPayment = {
  id: string;
  saleId: string;
  date: string;
  amountCents: number;
  kind: 'sale' | 'repayment';
};
export type ShopExpense = {
  id: string;
  date: string;
  description: string;
  category: string;
  amountCents: number;
};
export type ShopMovement = {
  id: string;
  productId: string;
  date: string;
  kind: 'opening' | 'restock' | 'sale' | 'return' | 'adjustment';
  quantity: number;
  amountCents: number;
};
export type ShopData = {
  returns?: ShopReturn[];
  adjustments?: StockAdjustment[];
  suppliers?: ShopSupplier[];
  purchases?: SupplierPurchase[];
  supplierPayments?: SupplierPayment[];
  products: ShopProduct[];
  customers: ShopCustomer[];
  sales: ShopSale[];
  lines: ShopSaleLine[];
  payments: ShopPayment[];
  expenses: ShopExpense[];
  movements: ShopMovement[];
};
export type SaleInput = {
  productId: string;
  quantity: number;
  priceCents: number;
};
export const EMPTY_SHOP: ShopData = {
  returns: [],
  adjustments: [],
  suppliers: [],
  purchases: [],
  supplierPayments: [],
  products: [],
  customers: [],
  sales: [],
  lines: [],
  payments: [],
  expenses: [],
  movements: [],
};

export type ShopReturn = {
  id: string;
  saleId: string;
  lineId: string;
  date: string;
  quantity: number;
  amountCents: number;
  costCents: number;
  refundCents: number;
  restocked: number;
};
export type StockAdjustment = {
  id: string;
  productId: string;
  date: string;
  quantityDelta: number;
  costCents: number;
  reason: string;
};
export type ShopSupplier = { id: string; name: string; phone: string };
export type SupplierPurchase = {
  id: string;
  supplierId: string;
  productId: string;
  date: string;
  quantity: number;
  costCents: number;
  totalCents: number;
};
export type SupplierPayment = {
  id: string;
  purchaseId: string;
  date: string;
  amountCents: number;
};
