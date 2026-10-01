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
  kind: 'opening' | 'restock' | 'sale';
  quantity: number;
  amountCents: number;
};
export type ShopData = {
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
  products: [],
  customers: [],
  sales: [],
  lines: [],
  payments: [],
  expenses: [],
  movements: [],
};
