import LinearGradient from 'react-native-linear-gradient';
import { SegmentedControl } from '../components/SegmentedControl';
import { ShopNavigationRow } from '../components/ShopNavigationRow';
import { ShopTools } from '../components/ShopTools';
import { getLocale } from '../i18n';
import { t } from '../i18n';
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
  BackHandler,
  KeyboardAvoidingView,
  Keyboard,
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
  new Date(date).toLocaleString(getLocale(), {
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
  const [showGuide, setShowGuide] = useState(false);
  const [showCalculation, setShowCalculation] = useState(false);
  const [showTools, setShowTools] = useState(false);
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
        setError(t('Could not open your shop ledger. Try again.'));
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
      setNotice(t('Add a product with stock before recording a sale.'));
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
      detail: t('Sale · {customer}{status}', {
        customer: s.customerId
          ? data.customers.find(c => c.id === s.customerId)?.name ??
            t('Customer')
          : t('Walk-in'),
        status:
          remaining(s, data) > 0
            ? t(' · Unpaid {amount}', { amount: money(remaining(s, data)) })
            : t(' · Paid'),
      }),
      amount: s.totalCents,
      kind: 'sale',
    })),
    ...data.expenses.map(e => ({
      id: e.id,
      date: e.date,
      title: e.description,
      detail: t('Expense · {category}', { category: t(e.category) }),
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
          )?.name ?? t('Customer'),
        detail: t('Customer repayment'),
        amount: p.amountCents,
        kind: 'payment',
      })),
    ...data.movements
      .filter(m => m.kind !== 'sale')
      .map(m => ({
        id: m.id,
        date: m.date,
        title:
          data.products.find(p => p.id === m.productId)?.name ?? t('Product'),
        detail: t('{kind} · {quantity} units', {
          kind:
            m.kind === 'opening'
              ? t('Opening stock')
              : m.kind === 'return'
              ? t('Returned stock')
              : m.kind === 'adjustment'
              ? t('Stock correction')
              : t('Buy stock'),
          quantity: m.quantity,
        }),
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
              {t('Shop')}
            </Text>
            <Text allowFontScaling style={styles.muted}>
              {t('Your shop notebook')}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t(
              'Reporting period: {period}. Tap to change.',
              { period: t(periodLabels[period]) },
            )}
            onPress={() => setPeriodPicker(true)}
            style={styles.period}
          >
            <Text allowFontScaling style={styles.rowTitle}>
              {t(periodLabels[period])} ▾
            </Text>
          </Pressable>
        </View>
        <SegmentedControl
          options={[t('Daily totals'), t('Products'), t('Customers')]}
          value={(['overview', 'stock', 'customers'] as Section[]).indexOf(
            section,
          )}
          minItemHeight={48}
          allowFontScaling
          accessibilityLabel={t('Shop sections')}
          onChange={index => {
            setSection(
              (['overview', 'stock', 'customers'] as Section[])[index],
            );
            setSearch('');
            setNotice('');
          }}
        />
        {loading ? (
          <View style={styles.empty}>
            <ActivityIndicator color={C.gold} />
            <Text allowFontScaling style={styles.muted}>
              {t('Opening your ledger…')}
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
              title={t('Try again')}
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
                {!data.products.length && !activity.length && (
                  <View style={styles.setup}>
                    <Text allowFontScaling style={styles.heading}>
                      {t('Start with what is on your shelf')}
                    </Text>
                    <Text allowFontScaling style={styles.muted}>
                      {t(
                        'Add one product and its quantity. Then you can record your first sale.',
                      )}
                    </Text>
                    <Button
                      title={t('Add your first product')}
                      primary
                      onPress={() => setForm({ kind: 'product' })}
                    />
                  </View>
                )}
                <View style={styles.summary}>
                  <LinearGradient
                    pointerEvents="none"
                    colors={[C.goldHighlight, C.goldMid, C.goldDeep]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={styles.profitHeader}>
                    <Text
                      allowFontScaling
                      style={[styles.heroLabel, styles.flex]}
                    >
                      {totals.profitCents < 0 ? t('Loss ·') : t('Profit ·')}{' '}
                      {t(periodLabels[period])}
                    </Text>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={
                        showCalculation
                          ? t('Hide profit calculation')
                          : t('Show profit calculation')
                      }
                      accessibilityState={{ expanded: showCalculation }}
                      style={styles.detailsButton}
                      onPress={() => setShowCalculation(value => !value)}
                    >
                      <Text allowFontScaling style={styles.heroMuted}>
                        {showCalculation ? t('Hide details') : t('Details')}
                      </Text>
                    </Pressable>
                  </View>
                  <View style={styles.profitRow}>
                    <Text
                      allowFontScaling
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.65}
                      style={[
                        styles.profit,
                        styles.flex,
                        totals.profitCents < 0 && styles.loss,
                      ]}
                    >
                      {(totals.profitCents / 100).toLocaleString(getLocale(), {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Text>
                    <Text allowFontScaling style={styles.currency}>
                      {t('ETB')}
                    </Text>
                  </View>
                  {showCalculation && (
                    <View style={styles.calculation}>
                      <Text allowFontScaling style={styles.heroMuted}>
                        {t(
                          'Sales − purchase cost of sold items − shop expenses',
                        )}
                      </Text>
                      <View style={styles.divider} />
                      {[
                        [t('Sales'), totals.salesCents],
                        [t('What sold items cost you'), totals.costCents],
                        [t('Expenses'), totals.expenseCents],
                      ].map(([label, amount]) => (
                        <View key={String(label)} style={styles.totalRow}>
                          <Text allowFontScaling style={styles.heroMuted}>
                            {label}
                          </Text>
                          <Text allowFontScaling style={styles.rowTitle}>
                            {money(Number(amount))}
                          </Text>
                        </View>
                      ))}
                      <Text allowFontScaling style={styles.heroHint}>
                        {t(
                          'Profit includes sales customers have not paid for yet. It is not your cash balance.',
                        )}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.recordActions}>
                  <Text allowFontScaling style={styles.rowTitle}>
                    {t('Add a shop record')}
                  </Text>
                  <Button
                    title={t('＋ Record sale')}
                    primary
                    onPress={openSale}
                  />
                  <View style={styles.actions}>
                    <View style={styles.flex}>
                      <Button title={t('Buy stock')} onPress={openRestock} />
                    </View>
                    <View style={styles.flex}>
                      <Button
                        title={t('Add expense')}
                        onPress={() => setForm({ kind: 'expense' })}
                      />
                    </View>
                  </View>
                </View>
                <View style={styles.navigationGroup}>
                  <View style={[styles.balanceRow, styles.balanceDivider]}>
                    <View style={styles.balanceLabels}>
                      <Text allowFontScaling style={styles.rowTitle}>
                        {t('Money received')}
                      </Text>
                      <Text allowFontScaling style={styles.small}>
                        {t('{period} · after refunds', {
                          period: t(periodLabels[period]),
                        })}
                      </Text>
                    </View>
                    <Text
                      allowFontScaling
                      style={[
                        styles.balanceValue,
                        { color: totals.collectedCents < 0 ? C.red : C.green },
                      ]}
                    >
                      {money(totals.collectedCents)}
                    </Text>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('View customer debts')}
                    style={styles.balanceRow}
                    onPress={() => {
                      setSection('customers');
                      setSearch('');
                    }}
                  >
                    <View style={styles.balanceLabels}>
                      <Text allowFontScaling style={styles.rowTitle}>
                        {t('Customers owe')}
                      </Text>
                      <Text allowFontScaling style={styles.small}>
                        {t('All unpaid sales')}
                      </Text>
                    </View>
                    <Text allowFontScaling style={styles.balanceValue}>
                      {money(totals.outstandingCents)}
                    </Text>
                    <Text accessible={false} style={styles.muted}>
                      ›
                    </Text>
                  </Pressable>
                </View>
                <View style={styles.navigationGroup}>
                  <ShopNavigationRow
                    title={t('More shop tools')}
                    description={t('Returns, reports and supplier debts')}
                    icon="tools"
                    onPress={() => setShowTools(true)}
                  />
                  <ShopNavigationRow
                    title={t('How to use Shop')}
                    icon="help"
                    expanded={showGuide}
                    last
                    onPress={() => setShowGuide(value => !value)}
                  />
                </View>
                {showGuide && (
                  <View style={styles.guide}>
                    {[
                      [
                        t('1. Add your products'),
                        t(
                          'Enter what you sell, how many you have, and your buying and selling prices.',
                        ),
                      ],
                      [
                        t('2. Write down each sale'),
                        t(
                          'Choose the items sold and the money paid. If some money is still owed, choose a customer.',
                        ),
                      ],
                      [
                        t('3. Add purchases and expenses'),
                        t(
                          'Buy stock adds items to your shelf. Add expense records costs such as rent and transport.',
                        ),
                      ],
                      [
                        t('4. Check your totals'),
                        t(
                          'See your profit, money received and what customers owe. Open Customers when someone pays their debt.',
                        ),
                      ],
                    ].map(([title, detail]) => (
                      <View key={title} style={styles.guideStep}>
                        <Text allowFontScaling style={styles.rowTitle}>
                          {title}
                        </Text>
                        <Text allowFontScaling style={styles.muted}>
                          {detail}
                        </Text>
                      </View>
                    ))}
                    <Text allowFontScaling style={styles.small}>
                      {t(
                        'Money received includes sale payments and later debt payments. Refunds reduce it.',
                      )}
                    </Text>
                    <Text allowFontScaling style={styles.small}>
                      {t(
                        'Example: buy an item for 100 ETB and sell it for 150 ETB. Your profit is 50 ETB before shop expenses, even if the customer pays later.',
                      )}
                    </Text>
                  </View>
                )}
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
                      {t('products need restocking ›')}{' '}
                    </Text>
                  </Pressable>
                )}
                {(data.products.length > 0 || activity.length > 0) && (
                  <>
                    <View style={styles.sectionHeader}>
                      <Text allowFontScaling style={styles.heading}>
                        {t('Recent activity')}
                      </Text>
                      <Pressable
                        accessibilityRole="button"
                        style={styles.link}
                        onPress={() => setSection('history')}
                      >
                        <Text allowFontScaling style={styles.gold}>
                          {t('View all ›')}
                        </Text>
                      </Pressable>
                    </View>
                    {activity.length ? (
                      rows(activity.slice(0, 3))
                    ) : (
                      <Empty
                        title={t('Ready for your first sale')}
                        detail={t(
                          'Tap Record sale, choose the items and enter what the customer paid. We will update stock and totals for you.',
                        )}
                      />
                    )}
                  </>
                )}
              </>
            )}
            {section === 'stock' && (
              <>
                <View style={styles.sectionHeader}>
                  <View>
                    <Text allowFontScaling style={styles.heading}>
                      {t('Products')}
                    </Text>
                    <Text allowFontScaling style={styles.muted}>
                      {t('Cost of items you still have')}{' '}
                      {money(totals.stockValueCents)}
                    </Text>
                  </View>
                  <Button
                    title={t('＋ Add product')}
                    primary
                    onPress={() => setForm({ kind: 'product' })}
                  />
                </View>
                <Field
                  label={t('Search products')}
                  value={search}
                  onChange={setSearch}
                  placeholder={t('Product name')}
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
                        {t('Sell')} {money(product.priceCents)}{' '}
                        {t('· Average buying price')} {money(product.costCents)}
                      </Text>
                      {product.quantity <= product.lowStock && (
                        <Text allowFontScaling style={styles.error}>
                          {product.quantity === 0
                            ? t('Out of stock')
                            : t('Low stock')}
                        </Text>
                      )}
                      <View style={styles.actions}>
                        <View style={styles.flex}>
                          <Button
                            title={t('Buy stock')}
                            onPress={() =>
                              setForm({ kind: 'restock', product })
                            }
                          />
                        </View>
                        <View style={styles.flex}>
                          <Button
                            title={t('Edit product')}
                            onPress={() => setForm({ kind: 'edit', product })}
                          />
                        </View>
                      </View>
                    </View>
                  ))
                ) : (
                  <Empty
                    title={
                      query
                        ? t('No matching products')
                        : t('Add your first product')
                    }
                    detail={
                      query
                        ? t('Try a different product name.')
                        : t(
                            'Enter its name, cost, selling price, and how many units you have.',
                          )
                    }
                  />
                )}
              </>
            )}
            {section === 'customers' && (
              <>
                <View style={styles.sectionHeader}>
                  <Text allowFontScaling style={styles.heading}>
                    {t('Customers')}
                  </Text>
                  <Button
                    title={t('＋ Add customer')}
                    primary
                    onPress={() => setForm({ kind: 'customer' })}
                  />
                </View>
                <Field
                  label={t('Search customers')}
                  value={search}
                  onChange={setSearch}
                  placeholder={t('Name or phone')}
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
                          {c.phone || t('No phone number')}
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
                          {t('Unpaid ›')}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                {!data.customers.length && (
                  <Empty
                    title={t('Keep track of customer credit')}
                    detail={t(
                      'Add a customer before recording a sale with an unpaid balance. Record their repayments here.',
                    )}
                  />
                )}
                {!!data.customers.length &&
                  !data.customers.some(c =>
                    `${c.name} ${c.phone}`.toLowerCase().includes(query),
                  ) && (
                    <Empty
                      title={t('No matching customers')}
                      detail={t('Try a different name or phone number.')}
                    />
                  )}
              </>
            )}
            {section === 'history' && (
              <>
                <Button
                  title={t('‹ Back to overview')}
                  onPress={() => setSection('overview')}
                />
                <Text allowFontScaling style={styles.heading}>
                  {t('All activity')}
                </Text>
                {activity.length ? (
                  rows(activity)
                ) : (
                  <Empty
                    title={t('No activity yet')}
                    detail={t(
                      'Sales, stock purchases, expenses and repayments will appear here.',
                    )}
                  />
                )}
              </>
            )}
          </>
        )}
      </ScrollView>
      {showTools && (
        <ShopTools
          data={data}
          onClose={() => setShowTools(false)}
          onChanged={refresh}
        />
      )}
      <Modal
        visible={periodPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setPeriodPicker(false)}
      >
        <View style={styles.dialogBackdrop}>
          <View style={styles.dialog}>
            <Text allowFontScaling style={styles.heading}>
              {t('Reporting period')}
            </Text>
            {(['today', 'month', 'all'] as ShopPeriod[]).map(value => (
              <Button
                key={value}
                title={`${period === value ? '✓ ' : ''}${t(
                  periodLabels[value],
                )}`}
                onPress={() => {
                  setPeriod(value);
                  setPeriodPicker(false);
                }}
              />
            ))}
            <Button
              title={t('Cancel')}
              onPress={() => setPeriodPicker(false)}
            />
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
              title={t('‹ Back to customers')}
              onPress={() => setCustomer(null)}
            />
            <Text allowFontScaling style={styles.title}>
              {customer?.name}
            </Text>
            <Text allowFontScaling style={styles.muted}>
              {customer?.phone || t('Customer ledger')}
            </Text>
            <View style={styles.summary}>
              <Text allowFontScaling style={styles.label}>
                {t('This customer owes')}
              </Text>
              <Text allowFontScaling style={styles.profit}>
                {money(
                  customerSales.reduce((sum, s) => sum + remaining(s, data), 0),
                )}
              </Text>
            </View>
            <Text allowFontScaling style={styles.heading}>
              {t('Sales & debt payments')}
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
                    {dateLabel(sale.date)} {t('· Sale')}{' '}
                    {money(sale.totalCents)}
                  </Text>
                  <Text allowFontScaling style={styles.rowTitle}>
                    {t('Unpaid')} {money(remaining(sale, data))}
                  </Text>
                  {data.payments
                    .filter(p => p.saleId === sale.id)
                    .map(p => (
                      <Text allowFontScaling key={p.id} style={styles.small}>
                        {t('Received')} {money(p.amountCents)} ·{' '}
                        {dateLabel(p.date)}
                      </Text>
                    ))}
                  {remaining(sale, data) > 0 && (
                    <Button
                      title={t('Record debt payment')}
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
                title={t('No sales for this customer')}
                detail={t(
                  'Choose this customer when recording their next sale.',
                )}
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
            setNotice(t('Saved to your shop notebook.'));
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
    unit: form.product?.unit ?? t('pieces'),
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
  const [showDiscard, setShowDiscard] = useState(false);
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
    product: t('Add product'),
    edit: t('Edit product'),
    restock: t('Buy stock'),
    sale: t('Record sale'),
    expense: t('Add expense'),
    customer: t('Add customer'),
    repayment: t('Record debt payment'),
  };
  const close = () => {
    if (saving.current) return;
    if (!dirty && !lines.length) {
      onClose();
      return;
    }
    Keyboard.dismiss();
    setShowDiscard(true);
  };
  const total = lines.reduce((sum, l) => sum + l.quantity * l.priceCents, 0);
  const chooseProduct = (product: ShopProduct) => {
    setProductId(product.id);
    setLinePrice(String(product.priceCents / 100));
    setDirty(true);
  };
  const addLine = () => {
    try {
      if (!productId) throw new Error(t('Choose a product.'));
      const quantity = parseQuantity(lineQuantity);
      const priceCents = parseMoney(linePrice);
      const product = data.products.find(p => p.id === productId)!;
      if (!quantity || quantity > product.quantity)
        throw new Error(
          t('Available stock: {quantity} {unit}.', {
            quantity: product.quantity,
            unit: product.unit,
          }),
        );
      if (lines.some(l => l.productId === productId))
        throw new Error(
          t(
            'This product is already in the sale. Remove its line to change the quantity.',
          ),
        );
      setLines(prev => [...prev, { productId, quantity, priceCents }]);
      setProductId('');
      setLineQuantity('1');
      setLinePrice('');
      setDirty(true);
      setError('');
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : t('Check the sale line.'),
      );
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
            throw new Error(
              t('Save the new customer first, then save the sale.'),
            );
          if (productId)
            throw new Error(
              t('Tap Add to sale for the selected product before saving.'),
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
          : t('Could not save. Your entry is still here; please try again.'),
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
          : t('Could not save the customer. Try again.'),
      );
    } finally {
      saving.current = false;
      setBusy(false);
    }
  };
  return (
    <>
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
                <Button title={t('Cancel')} disabled={busy} onPress={close} />
              </View>
              <Text allowFontScaling style={styles.muted}>
                {form.kind === 'sale'
                  ? t(
                      'Choose what you sold, add it to the sale, then enter how much the customer paid.',
                    )
                  : form.kind === 'restock'
                  ? t(
                      'Use this when you buy more items to sell. Enter the quantity and the price you paid for one.',
                    )
                  : form.kind === 'repayment'
                  ? t(
                      'Record a payment for this past sale. You cannot enter more than the customer owes.',
                    )
                  : form.kind === 'expense'
                  ? t(
                      'Record money spent to run your shop. Product purchases go under Buy stock.',
                    )
                  : form.kind === 'customer'
                  ? t(
                      'Add someone who buys on credit so you can track what they owe.',
                    )
                  : form.kind === 'product'
                  ? t(
                      'Add an item you sell. Prices are for one piece, pack or bottle, not the whole stock.',
                    )
                  : t(
                      'Update this product for future sales. Past sales will stay the same.',
                    )}
              </Text>
              {(form.kind === 'product' || form.kind === 'edit') && (
                <>
                  {input('name', t('Product name'), false, t('e.g. Coffee'))}
                  {input(
                    'unit',
                    t('How do you count this item?'),
                    false,
                    t('e.g. pieces, packs, bottles'),
                  )}
                  {form.kind === 'product' && (
                    <>
                      {input('quantity', t('How many do you have now?'), true)}
                      {input(
                        'cost',
                        t('What did one cost you? (ETB)'),
                        true,
                        '0.00',
                      )}
                    </>
                  )}
                  {input(
                    'price',
                    t('What do you sell one for? (ETB)'),
                    true,
                    '0.00',
                  )}
                  {input(
                    'lowStock',
                    t('Remind me when only this many are left'),
                    true,
                  )}
                  <Text allowFontScaling style={styles.muted}>
                    {form.kind === 'edit'
                      ? t(
                          'New names, units and prices apply to future sales. Past sales keep their original details.',
                        )
                      : t(
                          'Enter the items already on your shelf. Use Buy stock for later purchases. Use whole numbers for quantities.',
                        )}
                  </Text>
                </>
              )}
              {form.kind === 'customer' && (
                <>
                  {input('name', t('Customer name'))}
                  {input(
                    'phone',
                    t('Phone (optional)'),
                    false,
                    t('Phone number'),
                  )}
                  <Text allowFontScaling style={styles.muted}>
                    {t('Customers let you record unpaid sales and repayments.')}
                  </Text>
                </>
              )}
              {(form.kind === 'restock' || form.kind === 'sale') && (
                <>
                  <Text allowFontScaling style={styles.heading}>
                    {t('Choose a product')}
                  </Text>
                  {form.kind === 'restock' && !!form.product ? (
                    <Text allowFontScaling style={styles.rowTitle}>
                      {form.product.name} · {form.product.quantity}{' '}
                      {form.product.unit} {t('in stock')}{' '}
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
                      {input('quantity', t('How many did you buy?'), true)}
                      {input(
                        'cost',
                        t('What did you pay for one? (ETB)'),
                        true,
                        '0.00',
                      )}
                      <Text allowFontScaling style={styles.muted}>
                        {t(
                          'This adds items to your stock and updates their average purchase cost. Their cost reduces profit when you sell them.',
                        )}
                      </Text>
                    </>
                  ) : (
                    <>
                      {!!productId && (
                        <>
                          <Field
                            label={t('How many are you selling?')}
                            value={lineQuantity}
                            numeric
                            onChange={value => {
                              setLineQuantity(value);
                              setDirty(true);
                            }}
                          />
                          <Field
                            label={t('What do you sell one for? (ETB)')}
                            value={linePrice}
                            numeric
                            onChange={value => {
                              setLinePrice(value);
                              setDirty(true);
                            }}
                          />
                          <Button title={t('Add to sale')} onPress={addLine} />
                        </>
                      )}
                      <Text allowFontScaling style={styles.heading}>
                        {t('Sale items')}
                      </Text>
                      {!lines.length && (
                        <Text allowFontScaling style={styles.muted}>
                          {t(
                            'Choose a product, enter the quantity and add it to the sale.',
                          )}
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
                            title={t('Remove')}
                            onPress={() => {
                              setLines(prev =>
                                prev.filter(
                                  l => l.productId !== line.productId,
                                ),
                              );
                              setDirty(true);
                            }}
                          />
                        </View>
                      ))}
                      <View style={styles.totalRow}>
                        <Text allowFontScaling style={styles.heading}>
                          {t('Sale total')}
                        </Text>
                        <Text allowFontScaling style={styles.heading}>
                          {money(total)}
                        </Text>
                      </View>
                      {input(
                        'received',
                        t('How much did the customer pay? (ETB)'),
                        true,
                        t('{amount} — full payment', {
                          amount: (total / 100).toFixed(2),
                        }),
                      )}
                      <Text allowFontScaling style={styles.muted}>
                        {t(
                          'Paid in full? Leave this blank. Paid some? Enter that amount. Paid nothing? Enter 0.',
                        )}
                      </Text>
                      <Text allowFontScaling style={styles.heading}>
                        {t('Customer')}
                      </Text>
                      <Text allowFontScaling style={styles.muted}>
                        {t(
                          'If the customer will pay later, choose their name. Add a new customer here if needed.',
                        )}
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
                            {t('No customer name · paid in full')}
                          </Text>
                        </Pressable>
                        {[...data.customers, ...extraCustomers].map(c => (
                          <Pressable
                            key={c.id}
                            accessibilityRole="button"
                            accessibilityState={{
                              selected: customerId === c.id,
                            }}
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
                            ? t('Cancel new customer')
                            : t('＋ New customer')
                        }
                        disabled={busy}
                        onPress={() => setCreatingCustomer(value => !value)}
                      />
                      {creatingCustomer && (
                        <>
                          {input('name', t('New customer name'))}
                          {input('phone', t('Phone (optional)'))}
                          <Button
                            title={
                              busy
                                ? t('Saving customer…')
                                : t('Save customer & keep sale')
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
                    t('What was the expense?'),
                    false,
                    t('e.g. Monthly shop rent'),
                  )}
                  <Text allowFontScaling style={styles.label}>
                    {t('Category')}
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
                          <Text allowFontScaling>{t(category)}</Text>
                        </Pressable>
                      ),
                    )}
                  </View>
                  {input('amount', t('Amount (ETB)'), true, '0.00')}
                  <Text allowFontScaling style={styles.muted}>
                    {t(
                      'Use this for rent, transport, wages or bills. Buying items to sell? Use Buy stock instead.',
                    )}
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
                    {t('Sale on')} {dateLabel(form.sale!.date)}
                  </Text>
                  <Text allowFontScaling style={styles.heading}>
                    {t('Unpaid')} {money(remaining(form.sale!, data))}
                  </Text>
                  {input(
                    'amount',
                    t('How much did they pay? (ETB)'),
                    true,
                    '0.00',
                  )}
                  <Text allowFontScaling style={styles.muted}>
                    {t(
                      'This reduces what the customer owes and increases money received. It does not count as a new sale.',
                    )}
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
                    ? t('Saving…')
                    : form.kind === 'sale'
                    ? t('Save sale')
                    : form.kind === 'repayment'
                    ? t('Save debt payment')
                    : t('Save')
                }
                primary
                disabled={busy}
                onPress={save}
              />
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
      {showDiscard && (
        <Modal
          visible
          transparent
          animationType="fade"
          onRequestClose={() => setShowDiscard(false)}
        >
          <View style={styles.dialogBackdrop}>
            <View accessibilityViewIsModal style={styles.dialog}>
              <Text
                allowFontScaling
                accessibilityRole="header"
                style={styles.heading}
              >
                {form.kind === 'sale'
                  ? t('Discard this sale?')
                  : t('Discard this entry?')}
              </Text>
              <Text allowFontScaling style={styles.muted}>
                {form.kind === 'sale'
                  ? t(
                      'This sale has not been saved. Its items and payment details will be lost.',
                    )
                  : t('Your unsaved changes will be lost.')}
              </Text>
              <Button
                title={t('Keep editing')}
                primary
                onPress={() => setShowDiscard(false)}
              />
              <Pressable
                accessibilityRole="button"
                disabled={busy}
                accessibilityState={{ disabled: busy }}
                style={({ pressed }) => [styles.button, pressed && styles.dim]}
                onPress={() => {
                  if (!saving.current) {
                    setShowDiscard(false);
                    onClose();
                  }
                }}
              >
                <Text
                  allowFontScaling
                  style={[styles.buttonText, styles.error]}
                >
                  {form.kind === 'sale' ? t('Discard sale') : t('Discard')}
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
}
const styles = StyleSheet.create({
  guide: { gap: 18, paddingVertical: 8 },
  guideStep: { gap: 6 },
  setup: { gap: 12, paddingVertical: 12 },
  screen: { flex: 1, backgroundColor: theme.colors.background },
  content: { paddingHorizontal: 20, paddingTop: 8, gap: 20 },
  formContent: { padding: 20, paddingBottom: 40, gap: 16 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: { color: C.label, fontSize: 32, fontWeight: '800', letterSpacing: -1 },
  heading: {
    color: C.label,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  label: { color: C.label2, fontSize: 14, lineHeight: 21 },
  muted: { color: C.label2, fontSize: 14, lineHeight: 21 },
  small: { color: C.label2, fontSize: 12, lineHeight: 18 },
  rowTitle: { color: C.label, fontSize: 16, fontWeight: '600' },
  period: {
    backgroundColor: C.grouped1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 18,
    minHeight: 48,
  },
  gold: { color: C.gold },
  summary: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: C.goldMid,
    borderRadius: 20,
    borderCurve: 'continuous',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: C.goldBorder,
    gap: 6,
  },
  profitHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailsButton: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  calculation: { gap: 10, paddingTop: 8 },
  recordActions: { gap: 12 },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    padding: 16,
    minHeight: 64,
  },
  balanceDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.separator,
  },
  balanceLabels: { flex: 1, minWidth: 120, gap: 4 },
  balanceValue: {
    color: C.label,
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    flexShrink: 1,
  },
  heroLabel: {
    color: theme.colors.iOS.heroGold,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  heroMuted: { color: '#C9BB93', fontSize: 14, lineHeight: 21 },
  heroHint: { color: '#C9BB93', fontSize: 12, lineHeight: 18 },
  navigationGroup: {
    backgroundColor: C.grouped1,
    borderRadius: 16,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  profitRow: { flexDirection: 'row', alignItems: 'baseline', gap: 10 },
  currency: { color: C.label2, fontSize: 14, fontWeight: '700' },
  loss: { color: C.red },
  profit: {
    color: C.label,
    fontSize: 28,
    fontWeight: '800',
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
    backgroundColor: C.grouped1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primary: { backgroundColor: C.gold, borderRadius: 16 },
  primaryText: { color: '#17140D' },
  buttonText: {
    color: C.label,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  dim: { opacity: 0.55 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 4 },
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
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.separator,
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
