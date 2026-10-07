import { ShopData } from '../models/shop';
import { getLocale, t } from '../i18n';
import { money, remaining, shopTotals } from './shopUtils';
export function localDay(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(date.getDate()).padStart(2, '0')}`;
}
export function dailyClosing(data: ShopData, day: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day))
    throw new Error(t('Use a date in YYYY-MM-DD format.'));
  const [year, month, date] = day.split('-').map(Number);
  const end = new Date(year, month - 1, date, 23, 59, 59, 999);
  if (localDay(end) !== day || day > localDay())
    throw new Error(t('Choose a valid date that is not in the future.'));
  const totals = shopTotals(data, 'today', end);
  const returns = (data.returns ?? []).filter(
    item => localDay(new Date(item.date)) === day,
  );
  return [
    t('Daily closing summary'),
    day,
    `${t('Sales after returns')}: ${money(totals.salesCents)}`,
    `${t('What sold items cost you')}: ${money(totals.costCents)}`,
    `${t('Expenses')}: ${money(totals.expenseCents)}`,
    `${t('Profit / loss')}: ${money(totals.profitCents)}`,
    `${t('Refunds')}: ${money(
      returns.reduce((sum, item) => sum + item.refundCents, 0),
    )}`,
    `${t('Money received after refunds')}: ${money(totals.collectedCents)}`,
    t(
      'Based on recorded entries. Supplier payments and stock purchases are not running expenses.',
    ),
  ].join('\n');
}
export function customerStatement(data: ShopData, customerId: string): string {
  const customer = data.customers.find(item => item.id === customerId);
  if (!customer) throw new Error(t('Select an existing customer.'));
  const sales = data.sales.filter(item => item.customerId === customerId);
  const events = sales
    .flatMap(sale => {
      const items = data.lines
        .filter(line => line.saleId === sale.id)
        .map(line => `${line.name} × ${line.quantity}`)
        .join(', ');
      return [
        {
          date: sale.date,
          text: `${t('Sale')}: ${items} — ${money(sale.totalCents)}`,
        },
        ...data.payments
          .filter(payment => payment.saleId === sale.id)
          .map(payment => ({
            date: payment.date,
            text: `${t('Payment')}: ${money(payment.amountCents)}`,
          })),
        ...(data.returns ?? [])
          .filter(item => item.saleId === sale.id)
          .map(item => ({
            date: item.date,
            text: `${t('Return')}: ${money(item.amountCents)} · ${t(
              'Refund',
            )}: ${money(item.refundCents)}`,
          })),
      ];
    })
    .sort((left, right) => left.date.localeCompare(right.date));
  return [
    t('Customer statement'),
    customer.name,
    customer.phone,
    `${t('Current amount owed')}: ${money(
      sales.reduce((sum, sale) => sum + remaining(sale, data), 0),
    )}`,
    ...events.map(
      event =>
        `${new Date(event.date).toLocaleDateString(getLocale())} — ${
          event.text
        }`,
    ),
  ]
    .filter(Boolean)
    .join('\n');
}
