/*
THESIS: A daily ledger makes profit, collections and customer debt understandable at closing.
OWN-WORLD: Hisab's black canvas, flat grouped surfaces, system type and restrained gold actions.
STORY: Check today's result, record a sale, then manage stock and unpaid customer balances.
FIRST VIEWPORT: Shop/period header, section navigation, profit calculation, sale/restock/expense actions.
FORM: Daily ledger, grounded candidate 4; seed 31d9d944; approved shop-daily-ledger.png.
*/
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {
  AppText as Text,
  AppTextInput as TextInput,
} from '../components/AppText';
import {
  EMPTY_SHOP,
  SaleInput,
  ShopCustomer,
  ShopData,
  ShopProduct,
  ShopSale,
} from '../models/shop';
import {
  addCustomer,
  addExpense,
  addProduct,
  editProduct,
  loadShop,
  recordRepayment,
  recordSale,
  restockProduct,
} from '../db/shopDatabase';
import {
  money,
  parseMoney,
  parseQuantity,
  remaining,
  ShopPeriod,
  shopTotals,
} from '../utils/shopUtils';
import { theme } from '../theme';

const C = {
  ...theme.colors.iosSurface,
  gold: theme.colors.iOS.gold,
  green: theme.colors.iOS.green,
  red: theme.colors.iOS.red,
};
type Section = 'overview' | 'stock' | 'customers' | 'history';
type Form = {
  kind:
    | 'product'
    | 'edit'
    | 'restock'
    | 'sale'
    | 'expense'
    | 'customer'
    | 'repayment';
  product?: ShopProduct;
  sale?: ShopSale;
};
const dateLabel = (date: string) =>
  new Date(date).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
const periodLabels: Record<ShopPeriod, string> = {
  today: 'Today',
  month: 'This month',
  all: 'All time',
};
function Button({
  title,
  onPress,
  primary = false,
  disabled = false,
}: {
  title: string;
  onPress: () => void;
  primary?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        primary && styles.primary,
        (pressed || disabled) && styles.dim,
      ]}
    >
      <Text
        allowFontScaling
        style={[styles.buttonText, primary && styles.primaryText]}
      >
        {title}
      </Text>
    </Pressable>
  );
}
function Field({
  label,
  value,
  onChange,
  numeric = false,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  numeric?: boolean;
  placeholder?: string;
}) {
  return (
    <View style={styles.field}>
      <Text allowFontScaling style={styles.label}>
        {label}
      </Text>
      <TextInput
        allowFontScaling
        accessibilityLabel={label}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={C.label2}
        keyboardType={numeric ? 'decimal-pad' : 'default'}
        style={styles.input}
        maxLength={numeric ? 18 : 120}
      />
    </View>
  );
}
function Empty({ title, detail }: { title: string; detail: string }) {
  return (
    <View style={styles.empty}>
      <Text allowFontScaling style={styles.rowTitle}>
        {title}
      </Text>
      <Text allowFontScaling style={styles.muted}>
        {detail}
      </Text>
    </View>
  );
}
export function ShopScreen() {
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<ShopData>(EMPTY_SHOP);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [section, setSection] = useState<Section>('overview');
  const [period, setPeriod] = useState<ShopPeriod>('today');
  const [periodPicker, setPeriodPicker] = useState(false);
  const [form, setForm] = useState<Form | null>(null);
  const [customer, setCustomer] = useState<ShopCustomer | null>(null);
  const [search, setSearch] = useState('');
  const mounted = useRef(true);
  const refresh = useCallback(async () => {
    try {
      const next = await loadShop();
      if (mounted.current) {
        setData(next);
        setError('');
      }
    } catch {
      if (mounted.current)
        setError('Could not open your shop ledger. Try again.');
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);
  useEffect(() => {
    mounted.current = true;
    refresh();
    return () => {
      mounted.current = false;
    };
  }, [refresh]);
  // Refresh date-sensitive totals at midnight / on the next minute while the screen is open.
  const [, tick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => tick(n => n + 1), 60000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (customer) {
          setCustomer(null);
          return true;
        }
        if (section !== 'overview') {
          setSection('overview');
          return true;
        }
        return false;
      },
    );
    return () => subscription.remove();
  }, [customer, section]);
  const totals = shopTotals(data, period);
  const openSale = () => {
    if (!data.products.some(p => p.quantity > 0)) {
      setSection('stock');
      setNotice('Add a product with stock before recording a sale.');
      return;
    }
    setForm({ kind: 'sale' });
  };
  const openRestock = () => {
    if (!data.products.length) {
      setForm({ kind: 'product' });
      return;
    }
    setForm({ kind: 'restock' });
  };
  const activity = [
    ...data.sales.map(s => ({
      id: s.id,
      date: s.date,
      title: data.lines
        .filter(l => l.saleId === s.id)
        .map(l => `${l.name} × ${l.quantity}`)
        .join(', '),
      detail: `Sale · ${
        s.customerId
          ? data.customers.find(c => c.id === s.customerId)?.name ?? 'Customer'
          : 'Walk-in'
      }${
        remaining(s, data) > 0
          ? ` · Unpaid ${money(remaining(s, data))}`
          : ' · Paid'
      }`,
      amount: s.totalCents,
      kind: 'sale',
    })),
    ...data.expenses.map(e => ({
      id: e.id,
      date: e.date,
      title: e.description,
      detail: `Expense · ${e.category}`,
      amount: -e.amountCents,
      kind: 'expense',
    })),
    ...data.payments
      .filter(p => p.kind === 'repayment')
      .map(p => ({
        id: p.id,
        date: p.date,
        title:
          data.customers.find(
            c => c.id === data.sales.find(s => s.id === p.saleId)?.customerId,
          )?.name ?? 'Customer',
        detail: 'Customer repayment',
        amount: p.amountCents,
        kind: 'payment',
      })),
    ...data.movements
      .filter(m => m.kind !== 'sale')
      .map(m => ({
        id: m.id,
        date: m.date,
        title: data.products.find(p => p.id === m.productId)?.name ?? 'Product',
        detail: `${m.kind === 'opening' ? 'Opening stock' : 'Restock'} · ${
          m.quantity
        } units`,
        amount: -m.amountCents,
        kind: 'stock',
      })),
  ].sort((a, b) => b.date.localeCompare(a.date));
  const query = search.trim().toLowerCase();
  const products = [...data.products]
    .sort((a, b) => a.name.localeCompare(b.name))
    .filter(p => p.name.toLowerCase().includes(query));
  const customerSales = customer
    ? data.sales
        .filter(s => s.customerId === customer.id)
        .sort((a, b) => b.date.localeCompare(a.date))
    : [];
  const rows = (all: typeof activity) =>
    all.map(item => (
      <View key={item.id} style={styles.row}>
        <View style={styles.rowBody}>
          <Text allowFontScaling style={styles.rowTitle}>
            {item.title}
          </Text>
          <Text allowFontScaling style={styles.muted}>
            {item.detail}
          </Text>
          <Text allowFontScaling style={styles.small}>
            {dateLabel(item.date)}
          </Text>
        </View>
        <Text
          allowFontScaling
          style={[
            styles.amount,
            { color: item.amount < 0 ? C.label : C.green },
          ]}
        >
          {money(item.amount)}
        </Text>
      </View>
    ));

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.content,
          { paddingBottom: 100 + insets.bottom },
        ]}
      >
        <View style={styles.header}>
          <View>
            <Text allowFontScaling style={styles.title}>
              Shop
            </Text>
            <Text allowFontScaling style={styles.muted}>
              Your daily ledger
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Reporting period: ${periodLabels[period]}. Tap to change.`}
            onPress={() => setPeriodPicker(true)}
            style={styles.period}
          >
            <Text allowFontScaling style={styles.rowTitle}>
              {periodLabels[period]} ▾
            </Text>
          </Pressable>
        </View>
        <View style={styles.tabs}>
          {(['overview', 'stock', 'customers'] as Section[]).map(key => (
            <Pressable
              key={key}
              accessibilityRole="tab"
              accessibilityState={{ selected: section === key }}
              onPress={() => {
                setSection(key);
                setSearch('');
                setNotice('');
              }}
              style={[styles.tab, section === key && styles.tabActive]}
            >
              <Text
                allowFontScaling
                style={[styles.tabText, section === key && styles.gold]}
              >
                {key === 'overview'
                  ? 'Overview'
                  : key === 'stock'
                  ? 'Stock'
                  : 'Customers'}
              </Text>
            </Pressable>
          ))}
        </View>
        {loading ? (
          <View style={styles.empty}>
            <ActivityIndicator color={C.gold} />
            <Text allowFontScaling style={styles.muted}>
              Opening your ledger…
            </Text>
          </View>
        ) : error ? (
          <View style={styles.empty}>
            <Text
              allowFontScaling
              accessibilityRole="alert"
              style={styles.error}
            >
              {error}
            </Text>
            <Button
              title="Try again"
              onPress={() => {
                setLoading(true);
                refresh();
              }}
            />
          </View>
        ) : (
          <>
            {!!notice && (
              <Text
                allowFontScaling
                accessibilityLiveRegion="polite"
                style={styles.notice}
              >
                {notice}
              </Text>
            )}
            {section === 'overview' && (
              <>
                <View style={styles.summary}>
                  <Text allowFontScaling style={styles.label}>
                    Profit · {periodLabels[period]}
                  </Text>
                  <Text
                    allowFontScaling
                    style={[
                      styles.profit,
                      { color: totals.profitCents < 0 ? C.red : C.green },
                    ]}
                  >
                    {money(totals.profitCents)}
                  </Text>
                  <Text allowFontScaling style={styles.muted}>
                    Sales − cost of goods − expenses
                  </Text>
                  <View style={styles.divider} />
                  {[
                    ['Sales', totals.salesCents],
                    ['Cost of goods sold', totals.costCents],
                    ['Expenses', totals.expenseCents],
                  ].map(([label, amount]) => (
                    <View key={String(label)} style={styles.totalRow}>
                      <Text allowFontScaling style={styles.muted}>
                        {label}
                      </Text>
                      <Text allowFontScaling style={styles.rowTitle}>
                        {money(Number(amount))}
                      </Text>
                    </View>
                  ))}
                  <Text allowFontScaling style={styles.small}>
                    Based on the sales and expenses you record.
                  </Text>
                </View>
                <Button title="＋ Record sale" primary onPress={openSale} />
                <View style={styles.actions}>
                  <View style={styles.flex}>
                    <Button title="Restock" onPress={openRestock} />
                  </View>
                  <View style={styles.flex}>
                    <Button
                      title="Add expense"
                      onPress={() => setForm({ kind: 'expense' })}
                    />
                  </View>
                </View>
                <View style={styles.collection}>
                  <View style={styles.flex}>
                    <Text allowFontScaling style={styles.label}>
                      Collected · {periodLabels[period]}
                    </Text>
                    <Text
                      allowFontScaling
                      style={[styles.collectionValue, { color: C.green }]}
                    >
                      {money(totals.collectedCents)}
                    </Text>
                  </View>
                  <View style={styles.flex}>
                    <Text allowFontScaling style={styles.label}>
                      Unpaid · all time
                    </Text>
                    <Text allowFontScaling style={styles.collectionValue}>
                      {money(totals.outstandingCents)}
                    </Text>
                  </View>
                </View>
                <Text allowFontScaling style={styles.small}>
                  Collected includes repayments received in this period. Unpaid
                  includes all outstanding customer sales.
                </Text>
                {data.products.some(p => p.quantity <= p.lowStock) && (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setSection('stock')}
                    style={styles.lowStock}
                  >
                    <Text allowFontScaling style={styles.gold}>
                      {
                        data.products.filter(p => p.quantity <= p.lowStock)
                          .length
                      }{' '}
                      products need restocking ›
                    </Text>
                  </Pressable>
                )}
                <View style={styles.sectionHeader}>
                  <Text allowFontScaling style={styles.heading}>
                    Recent activity
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    style={styles.link}
                    onPress={() => setSection('history')}
                  >
                    <Text allowFontScaling style={styles.gold}>
                      View all ›
                    </Text>
                  </Pressable>
                </View>
                {activity.length ? (
                  rows(activity.slice(0, 5))
                ) : (
                  <Empty
                    title="Your shop starts here"
                    detail="Add your products and opening stock, then record the first sale. Your daily totals will update automatically."
                  />
                )}
              </>
            )}
            {section === 'stock' && (
              <>
                <View style={styles.sectionHeader}>
                  <View>
                    <Text allowFontScaling style={styles.heading}>
                      Products
                    </Text>
                    <Text allowFontScaling style={styles.muted}>
                      Stock value {money(totals.stockValueCents)}
                    </Text>
                  </View>
                  <Button
                    title="＋ Product"
                    primary
                    onPress={() => setForm({ kind: 'product' })}
                  />
                </View>
                <Field
                  label="Search products"
                  value={search}
                  onChange={setSearch}
                  placeholder="Product name"
                />
                {products.length ? (
                  products.map(product => (
                    <View key={product.id} style={styles.productRow}>
                      <View style={styles.totalRow}>
                        <Text
                          allowFontScaling
                          style={[styles.rowTitle, styles.flex]}
                        >
                          {product.name}
                        </Text>
                        <Text
                          allowFontScaling
                          style={[
                            styles.rowTitle,
                            product.quantity <= product.lowStock &&
                              styles.error,
                          ]}
                        >
                          {product.quantity} {product.unit}
                        </Text>
                      </View>
                      <Text allowFontScaling style={styles.muted}>
                        Sell {money(product.priceCents)} · Average cost{' '}
                        {money(product.costCents)}
                      </Text>
                      {product.quantity <= product.lowStock && (
                        <Text allowFontScaling style={styles.error}>
                          {product.quantity === 0
                            ? 'Out of stock'
                            : 'Low stock'}
                        </Text>
                      )}
                      <View style={styles.actions}>
                        <View style={styles.flex}>
                          <Button
                            title="Restock"
                            onPress={() =>
                              setForm({ kind: 'restock', product })
                            }
                          />
                        </View>
                        <View style={styles.flex}>
                          <Button
                            title="Edit product"
                            onPress={() => setForm({ kind: 'edit', product })}
                          />
                        </View>
                      </View>
                    </View>
                  ))
                ) : (
                  <Empty
                    title={
                      query ? 'No matching products' : 'Add your first product'
                    }
                    detail={
                      query
                        ? 'Try a different product name.'
                        : 'Enter its name, cost, selling price, and how many units you have.'
                    }
                  />
                )}
              </>
            )}
            {section === 'customers' && (
              <>
                <View style={styles.sectionHeader}>
                  <Text allowFontScaling style={styles.heading}>
                    Customers
                  </Text>
                  <Button
                    title="＋ Customer"
                    primary
                    onPress={() => setForm({ kind: 'customer' })}
                  />
                </View>
                <Field
                  label="Search customers"
                  value={search}
                  onChange={setSearch}
                  placeholder="Name or phone"
                />
                {data.customers
                  .filter(c =>
                    `${c.name} ${c.phone}`.toLowerCase().includes(query),
                  )
                  .map(c => (
                    <Pressable
                      key={c.id}
                      accessibilityRole="button"
                      onPress={() => setCustomer(c)}
                      style={styles.row}
                    >
                      <View style={styles.rowBody}>
                        <Text allowFontScaling style={styles.rowTitle}>
                          {c.name}
                        </Text>
                        <Text allowFontScaling style={styles.muted}>
                          {c.phone || 'No phone number'}
                        </Text>
                      </View>
                      <View>
                        <Text allowFontScaling style={styles.amount}>
                          {money(
                            data.sales
                              .filter(s => s.customerId === c.id)
                              .reduce((sum, s) => sum + remaining(s, data), 0),
                          )}
                        </Text>
                        <Text allowFontScaling style={styles.small}>
                          Unpaid ›
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                {!data.customers.length && (
                  <Empty
                    title="Keep track of customer credit"
                    detail="Add a customer before recording a sale with an unpaid balance. Record their repayments here."
                  />
                )}
                {!!data.customers.length &&
                  !data.customers.some(c =>
                    `${c.name} ${c.phone}`.toLowerCase().includes(query),
                  ) && (
                    <Empty
                      title="No matching customers"
                      detail="Try a different name or phone number."
                    />
                  )}
              </>
            )}
            {section === 'history' && (
              <>
                <Button
                  title="‹ Back to overview"
                  onPress={() => setSection('overview')}
                />
                <Text allowFontScaling style={styles.heading}>
                  All activity
                </Text>
                {activity.length ? (
                  rows(activity)
                ) : (
                  <Empty
                    title="No activity yet"
                    detail="Sales, stock purchases, expenses and repayments will appear here."
                  />
                )}
              </>
            )}
          </>
        )}
      </ScrollView>
      <Modal
        visible={periodPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setPeriodPicker(false)}
      >
        <View style={styles.dialogBackdrop}>
          <View style={styles.dialog}>
            <Text allowFontScaling style={styles.heading}>
              Reporting period
            </Text>
            {(['today', 'month', 'all'] as ShopPeriod[]).map(value => (
              <Button
                key={value}
                title={`${period === value ? '✓ ' : ''}${periodLabels[value]}`}
                onPress={() => {
                  setPeriod(value);
                  setPeriodPicker(false);
                }}
              />
            ))}
            <Button title="Cancel" onPress={() => setPeriodPicker(false)} />
          </View>
        </View>
      </Modal>
      <Modal
        visible={!!customer}
        animationType="slide"
        onRequestClose={() => setCustomer(null)}
      >
        <SafeAreaView style={styles.screen}>
          <ScrollView contentContainerStyle={styles.content}>
            <Button
              title="‹ Back to customers"
              onPress={() => setCustomer(null)}
            />
            <Text allowFontScaling style={styles.title}>
              {customer?.name}
            </Text>
            <Text allowFontScaling style={styles.muted}>
              {customer?.phone || 'Customer ledger'}
            </Text>
            <View style={styles.summary}>
              <Text allowFontScaling style={styles.label}>
                Total unpaid
              </Text>
              <Text allowFontScaling style={styles.profit}>
                {money(
                  customerSales.reduce((sum, s) => sum + remaining(s, data), 0),
                )}
              </Text>
            </View>
            <Text allowFontScaling style={styles.heading}>
              Sales & repayments
            </Text>
            {customerSales.length ? (
              customerSales.map(sale => (
                <View key={sale.id} style={styles.productRow}>
                  <Text allowFontScaling style={styles.rowTitle}>
                    {data.lines
                      .filter(l => l.saleId === sale.id)
                      .map(l => `${l.name} × ${l.quantity}`)
                      .join(', ')}
                  </Text>
                  <Text allowFontScaling style={styles.muted}>
                    {dateLabel(sale.date)} · Sale {money(sale.totalCents)}
                  </Text>
                  <Text allowFontScaling style={styles.rowTitle}>
                    Unpaid {money(remaining(sale, data))}
                  </Text>
                  {data.payments
                    .filter(p => p.saleId === sale.id)
                    .map(p => (
                      <Text allowFontScaling key={p.id} style={styles.small}>
                        Received {money(p.amountCents)} · {dateLabel(p.date)}
                      </Text>
                    ))}
                  {remaining(sale, data) > 0 && (
                    <Button
                      title="Record repayment"
                      primary
                      onPress={() => {
                        setCustomer(null);
                        setForm({ kind: 'repayment', sale });
                      }}
                    />
                  )}
                </View>
              ))
            ) : (
              <Empty
                title="No sales for this customer"
                detail="Choose this customer when recording their next sale."
              />
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
      {form && (
        <ShopForm
          form={form}
          data={data}
          onClose={() => {
            setForm(null);
            refresh();
          }}
          onSaved={async () => {
            setForm(null);
            await refresh();
            setNotice('Saved to your shop ledger.');
          }}
        />
      )}
    </SafeAreaView>
  );
}

function ShopForm({
  form,
  data,
  onClose,
  onSaved,
}: {
  form: Form;
  data: ShopData;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [values, setValues] = useState<Record<string, string>>({
    name: form.product?.name ?? '',
    unit: form.product?.unit ?? 'pieces',
    quantity: '0',
    cost: form.product ? String(form.product.costCents / 100) : '',
    price: form.product ? String(form.product.priceCents / 100) : '',
    lowStock: String(form.product?.lowStock ?? 5),
    category: 'Other',
    received: '',
    phone: '',
    description: '',
    amount: '',
  });
  const [productId, setProductId] = useState(form.product?.id ?? '');
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [extraCustomers, setExtraCustomers] = useState<ShopCustomer[]>([]);
  const [creatingCustomer, setCreatingCustomer] = useState(false);
  const [lines, setLines] = useState<SaleInput[]>([]);
  const [lineQuantity, setLineQuantity] = useState('1');
  const [linePrice, setLinePrice] = useState('');
  const [busy, setBusy] = useState(false);
  const saving = useRef(false);
  const [error, setError] = useState('');
  const [dirty, setDirty] = useState(false);
  const input = (
    key: string,
    label: string,
    numeric = false,
    placeholder?: string,
  ) => (
    <Field
      label={label}
      value={values[key] ?? ''}
      numeric={numeric}
      placeholder={placeholder}
      onChange={value => {
        setDirty(true);
        setValues(prev => ({ ...prev, [key]: value }));
      }}
    />
  );
  const titles = {
    product: 'Add product',
    edit: 'Edit product',
    restock: 'Restock',
    sale: 'Record sale',
    expense: 'Add expense',
    customer: 'Add customer',
    repayment: 'Record repayment',
  };
  const close = () => {
    if (saving.current) return;
    if (!dirty && !lines.length) {
      onClose();
      return;
    }
    Alert.alert('Discard this entry?', 'Your unsaved changes will be lost.', [
      { text: 'Keep editing', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: onClose },
    ]);
  };
  const total = lines.reduce((sum, l) => sum + l.quantity * l.priceCents, 0);
  const chooseProduct = (product: ShopProduct) => {
    setProductId(product.id);
    setLinePrice(String(product.priceCents / 100));
    setDirty(true);
  };
  const addLine = () => {
    try {
      if (!productId) throw new Error('Choose a product.');
      const quantity = parseQuantity(lineQuantity);
      const priceCents = parseMoney(linePrice);
      const product = data.products.find(p => p.id === productId)!;
      if (!quantity || quantity > product.quantity)
        throw new Error(
          `Available stock: ${product.quantity} ${product.unit}.`,
        );
      if (lines.some(l => l.productId === productId))
        throw new Error(
          'This product is already in the sale. Remove its line to change the quantity.',
        );
      setLines(prev => [...prev, { productId, quantity, priceCents }]);
      setProductId('');
      setLineQuantity('1');
      setLinePrice('');
      setDirty(true);
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Check the sale line.');
    }
  };
  const save = async () => {
    if (saving.current) return;
    saving.current = true;
    setBusy(true);
    setError('');
    try {
      switch (form.kind) {
        case 'product':
          await addProduct({
            name: values.name,
            unit: values.unit,
            quantity: parseQuantity(values.quantity),
            costCents: parseMoney(values.cost),
            priceCents: parseMoney(values.price),
            lowStock: parseQuantity(values.lowStock),
          });
          break;
        case 'edit':
          await editProduct(
            form.product!.id,
            values.name,
            values.unit,
            parseMoney(values.price),
            parseQuantity(values.lowStock),
          );
          break;
        case 'customer':
          await addCustomer(values.name, values.phone);
          break;
        case 'restock':
          await restockProduct(
            productId,
            parseQuantity(values.quantity),
            parseMoney(values.cost),
          );
          break;
        case 'expense':
          await addExpense(
            values.description,
            values.category,
            parseMoney(values.amount),
          );
          break;
        case 'repayment':
          await recordRepayment(form.sale!.id, parseMoney(values.amount));
          break;
        case 'sale': {
          if (creatingCustomer)
            throw new Error('Save the new customer first, then save the sale.');
          if (productId)
            throw new Error(
              'Tap Add to sale for the selected product before saving.',
            );
          await recordSale(
            lines,
            values.received.trim() ? parseMoney(values.received) : total,
            customerId,
          );
          break;
        }
      }
      await onSaved();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Could not save. Your entry is still here; please try again.',
      );
      saving.current = false;
      setBusy(false);
    }
  };
  const saveInlineCustomer = async () => {
    if (saving.current) return;
    saving.current = true;
    setBusy(true);
    setError('');
    try {
      const nextId = await addCustomer(values.name, values.phone);
      setExtraCustomers(previous => [
        ...previous,
        { id: nextId, name: values.name.trim(), phone: values.phone.trim() },
      ]);
      setCustomerId(nextId);
      setCreatingCustomer(false);
      setDirty(true);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Could not save the customer. Try again.',
      );
    } finally {
      saving.current = false;
      setBusy(false);
    }
  };
  return (
    <Modal visible animationType="slide" onRequestClose={close}>
      <SafeAreaView style={styles.screen}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.formContent}
          >
            <View style={styles.header}>
              <Text allowFontScaling style={[styles.heading, styles.flex]}>
                {titles[form.kind]}
              </Text>
              <Button title="Cancel" disabled={busy} onPress={close} />
            </View>
            {(form.kind === 'product' || form.kind === 'edit') && (
              <>
                {input('name', 'Product name', false, 'e.g. Coffee')}
                {input(
                  'unit',
                  'Unit label',
                  false,
                  'e.g. pieces, packs, bottles',
                )}
                {form.kind === 'product' && (
                  <>
                    {input('quantity', 'Opening stock (whole units)', true)}
                    {input('cost', 'Cost per unit (ETB)', true, '0.00')}
                  </>
                )}
                {input('price', 'Selling price per unit (ETB)', true, '0.00')}
                {input('lowStock', 'Low-stock alert at or below', true)}
                <Text allowFontScaling style={styles.muted}>
                  {form.kind === 'edit'
                    ? 'New names, units and prices apply to future sales. Past sales keep their original details.'
                    : 'Opening stock is stock you already own. Buy more using Restock; its cost is counted in profit as items sell.'}
                </Text>
              </>
            )}
            {form.kind === 'customer' && (
              <>
                {input('name', 'Customer name')}
                {input('phone', 'Phone (optional)', false, 'Phone number')}
                <Text allowFontScaling style={styles.muted}>
                  Customers let you record unpaid sales and repayments.
                </Text>
              </>
            )}
            {(form.kind === 'restock' || form.kind === 'sale') && (
              <>
                <Text allowFontScaling style={styles.heading}>
                  Choose a product
                </Text>
                {form.kind === 'restock' && !!form.product ? (
                  <Text allowFontScaling style={styles.rowTitle}>
                    {form.product.name} · {form.product.quantity}{' '}
                    {form.product.unit} in stock
                  </Text>
                ) : (
                  <View style={styles.choices}>
                    {data.products
                      .filter(p => form.kind === 'restock' || p.quantity > 0)
                      .map(product => (
                        <Pressable
                          key={product.id}
                          accessibilityRole="button"
                          accessibilityState={{
                            selected: productId === product.id,
                          }}
                          style={[
                            styles.choice,
                            productId === product.id && styles.choiceActive,
                          ]}
                          onPress={() => chooseProduct(product)}
                        >
                          <Text allowFontScaling style={styles.rowTitle}>
                            {product.name}
                          </Text>
                          <Text allowFontScaling style={styles.muted}>
                            {product.quantity} {product.unit} ·{' '}
                            {money(product.priceCents)}
                          </Text>
                        </Pressable>
                      ))}
                  </View>
                )}
                {form.kind === 'restock' ? (
                  <>
                    {input(
                      'quantity',
                      'Purchased quantity (whole units)',
                      true,
                    )}
                    {input(
                      'cost',
                      'Purchase cost per unit (ETB)',
                      true,
                      '0.00',
                    )}
                    <Text allowFontScaling style={styles.muted}>
                      Adds stock at a weighted average cost. Record rent and
                      other running costs as expenses.
                    </Text>
                  </>
                ) : (
                  <>
                    {!!productId && (
                      <>
                        <Field
                          label="Quantity (whole units)"
                          value={lineQuantity}
                          numeric
                          onChange={value => {
                            setLineQuantity(value);
                            setDirty(true);
                          }}
                        />
                        <Field
                          label="Selling price per unit (ETB)"
                          value={linePrice}
                          numeric
                          onChange={value => {
                            setLinePrice(value);
                            setDirty(true);
                          }}
                        />
                        <Button title="Add to sale" onPress={addLine} />
                      </>
                    )}
                    <Text allowFontScaling style={styles.heading}>
                      Sale items
                    </Text>
                    {!lines.length && (
                      <Text allowFontScaling style={styles.muted}>
                        Choose a product, enter the quantity and add it to the
                        sale.
                      </Text>
                    )}
                    {lines.map(line => (
                      <View key={line.productId} style={styles.row}>
                        <View style={styles.rowBody}>
                          <Text allowFontScaling style={styles.rowTitle}>
                            {
                              data.products.find(p => p.id === line.productId)
                                ?.name
                            }{' '}
                            × {line.quantity}
                          </Text>
                          <Text allowFontScaling style={styles.muted}>
                            {money(line.quantity * line.priceCents)}
                          </Text>
                        </View>
                        <Button
                          title="Remove"
                          onPress={() => {
                            setLines(prev =>
                              prev.filter(l => l.productId !== line.productId),
                            );
                            setDirty(true);
                          }}
                        />
                      </View>
                    ))}
                    <View style={styles.totalRow}>
                      <Text allowFontScaling style={styles.heading}>
                        Sale total
                      </Text>
                      <Text allowFontScaling style={styles.heading}>
                        {money(total)}
                      </Text>
                    </View>
                    {input(
                      'received',
                      'Collected now (ETB)',
                      true,
                      `${(total / 100).toFixed(2)} — full payment`,
                    )}
                    <Text allowFontScaling style={styles.muted}>
                      Leave blank for full payment. Enter 0 for a fully unpaid
                      sale.
                    </Text>
                    <Text allowFontScaling style={styles.heading}>
                      Customer
                    </Text>
                    <Text allowFontScaling style={styles.muted}>
                      Required when any amount is unpaid. You can add a new
                      customer here without losing this sale.
                    </Text>
                    <View style={styles.choices}>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityState={{ selected: !customerId }}
                        style={[
                          styles.choice,
                          !customerId && styles.choiceActive,
                        ]}
                        onPress={() => {
                          setCustomerId(null);
                          setDirty(true);
                        }}
                      >
                        <Text allowFontScaling style={styles.rowTitle}>
                          Walk-in · fully paid
                        </Text>
                      </Pressable>
                      {[...data.customers, ...extraCustomers].map(c => (
                        <Pressable
                          key={c.id}
                          accessibilityRole="button"
                          accessibilityState={{ selected: customerId === c.id }}
                          style={[
                            styles.choice,
                            customerId === c.id && styles.choiceActive,
                          ]}
                          onPress={() => {
                            setCustomerId(c.id);
                            setDirty(true);
                          }}
                        >
                          <Text allowFontScaling style={styles.rowTitle}>
                            {c.name}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                    <Button
                      title={
                        creatingCustomer
                          ? 'Cancel new customer'
                          : '＋ New customer'
                      }
                      disabled={busy}
                      onPress={() => setCreatingCustomer(value => !value)}
                    />
                    {creatingCustomer && (
                      <>
                        {input('name', 'New customer name')}
                        {input('phone', 'Phone (optional)')}
                        <Button
                          title={
                            busy
                              ? 'Saving customer…'
                              : 'Save customer & keep sale'
                          }
                          disabled={busy}
                          onPress={saveInlineCustomer}
                        />
                      </>
                    )}
                  </>
                )}
              </>
            )}
            {form.kind === 'expense' && (
              <>
                {input(
                  'description',
                  'What was the expense?',
                  false,
                  'e.g. Monthly shop rent',
                )}
                <Text allowFontScaling style={styles.label}>
                  Category
                </Text>
                <View style={styles.choices}>
                  {['Rent', 'Transport', 'Utilities', 'Wages', 'Other'].map(
                    category => (
                      <Pressable
                        key={category}
                        accessibilityRole="button"
                        accessibilityState={{
                          selected: values.category === category,
                        }}
                        style={[
                          styles.choice,
                          values.category === category && styles.choiceActive,
                        ]}
                        onPress={() => {
                          setValues(prev => ({ ...prev, category }));
                          setDirty(true);
                        }}
                      >
                        <Text allowFontScaling>{category}</Text>
                      </Pressable>
                    ),
                  )}
                </View>
                {input('amount', 'Amount (ETB)', true, '0.00')}
                <Text allowFontScaling style={styles.muted}>
                  For running costs. Use Restock for product purchases to keep
                  profit accurate.
                </Text>
              </>
            )}
            {form.kind === 'repayment' && (
              <>
                <Text allowFontScaling style={styles.rowTitle}>
                  {
                    data.customers.find(c => c.id === form.sale!.customerId)
                      ?.name
                  }
                </Text>
                <Text allowFontScaling style={styles.muted}>
                  Sale on {dateLabel(form.sale!.date)}
                </Text>
                <Text allowFontScaling style={styles.heading}>
                  Unpaid {money(remaining(form.sale!, data))}
                </Text>
                {input('amount', 'Amount received (ETB)', true, '0.00')}
                <Text allowFontScaling style={styles.muted}>
                  This reduces the unpaid balance and adds to collections.
                </Text>
              </>
            )}
            {!!error && (
              <Text
                allowFontScaling
                accessibilityRole="alert"
                accessibilityLiveRegion="assertive"
                style={styles.error}
              >
                {error}
              </Text>
            )}
            <Button
              title={
                busy
                  ? 'Saving…'
                  : form.kind === 'sale'
                  ? 'Save sale'
                  : form.kind === 'repayment'
                  ? 'Save repayment'
                  : 'Save'
              }
              primary
              disabled={busy}
              onPress={save}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  content: { paddingHorizontal: 20, paddingTop: 16, gap: 16 },
  formContent: { padding: 20, paddingBottom: 40, gap: 16 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: { color: C.label, fontSize: 34, fontWeight: '700' },
  heading: { color: C.label, fontSize: 21, fontWeight: '600' },
  label: { color: C.label2, fontSize: 14, lineHeight: 21 },
  muted: { color: C.label2, fontSize: 14, lineHeight: 21 },
  small: { color: C.label2, fontSize: 12, lineHeight: 18 },
  rowTitle: { color: C.label, fontSize: 16, fontWeight: '600' },
  period: {
    backgroundColor: C.grouped1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 12,
    minHeight: 48,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomColor: C.separator,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    paddingVertical: 12,
  },
  tabActive: { borderBottomColor: C.gold, borderBottomWidth: 2 },
  tabText: { color: C.label2, fontSize: 15, fontWeight: '600' },
  gold: { color: C.gold },
  summary: {
    padding: 20,
    backgroundColor: C.grouped1,
    borderRadius: 16,
    gap: 10,
  },
  profit: {
    color: C.label,
    fontSize: 36,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: C.separator,
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  button: {
    minHeight: 48,
    backgroundColor: C.grouped2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primary: { backgroundColor: C.gold },
  primaryText: { color: '#17140D' },
  buttonText: {
    color: C.label,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  dim: { opacity: 0.55 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 4 },
  collection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: C.grouped1,
    borderRadius: 16,
    padding: 18,
    gap: 16,
  },
  collectionValue: {
    fontSize: 23,
    fontWeight: '600',
    color: C.label,
    marginTop: 8,
    fontVariant: ['tabular-nums'],
  },
  sectionHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.separator,
  },
  rowBody: { flex: 1, gap: 5 },
  amount: {
    color: C.label,
    fontSize: 15,
    fontWeight: '600',
    flexShrink: 1,
    fontVariant: ['tabular-nums'],
  },
  link: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 8 },
  empty: { paddingVertical: 28, gap: 12 },
  notice: { color: C.gold, fontSize: 14, lineHeight: 21 },
  error: { color: C.red, fontSize: 14, lineHeight: 21 },
  lowStock: { minHeight: 48, justifyContent: 'center', paddingVertical: 12 },
  field: { gap: 8 },
  input: {
    minHeight: 52,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: C.label,
    backgroundColor: C.grouped1,
    borderRadius: 12,
    fontSize: 16,
  },
  productRow: {
    paddingVertical: 16,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.separator,
  },
  choices: { gap: 8 },
  choice: {
    minHeight: 48,
    padding: 14,
    gap: 5,
    borderWidth: 1,
    borderColor: C.separator,
    borderRadius: 12,
  },
  choiceActive: { borderColor: C.gold, backgroundColor: C.goldHighlight },
  dialogBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    padding: 24,
  },
  dialog: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: C.grouped1,
    gap: 12,
  },
});
