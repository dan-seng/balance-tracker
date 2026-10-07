import { ShopNavigationRow, ShopIcon } from './ShopNavigationRow';
import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText as Text, AppTextInput as TextInput } from './AppText';
import { ShopData } from '../models/shop';
import {
  addSupplier,
  correctStock,
  paySupplier,
  purchaseStock,
  recordReturn,
} from '../db/shopDatabase';
import {
  money,
  parseMoney,
  parseQuantity,
  returnPreview,
  supplierOwed,
} from '../utils/shopUtils';
import {
  customerStatement,
  dailyClosing,
  localDay,
} from '../utils/shopReports';
import { getLocale, t } from '../i18n';
import { theme } from '../theme';
type Page = 'menu' | 'returns' | 'stock' | 'daily' | 'statements' | 'suppliers';
type Props = {
  data: ShopData;
  onClose: () => void;
  onChanged: () => Promise<void>;
};
export function ShopTools({ data, onClose, onChanged }: Props) {
  const [page, setPage] = useState<Page>('menu');
  const [productId, setProduct] = useState('');
  const [saleId, setSale] = useState('');
  const [lineId, setLine] = useState('');
  const [customerId, setCustomer] = useState('');
  const [supplierId, setSupplier] = useState('');
  const [purchaseId, setPurchase] = useState('');
  const [quantity, setQuantity] = useState('');
  const [cost, setCost] = useState('');
  const [paid, setPaid] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [reason, setReason] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [day, setDay] = useState(localDay());
  const [restocked, setRestocked] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const saving = useRef(false);
  const run = async (operation: () => Promise<void>, changed = true) => {
    if (saving.current) return;
    saving.current = true;
    setBusy(true);
    setMessage('');
    try {
      await operation();
      if (changed) {
        await onChanged();
        setQuantity('');
        setPaid('');
        setPaymentAmount('');
        setMessage(t('Saved.'));
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : t('Could not save. Please try again.'),
      );
    } finally {
      saving.current = false;
      setBusy(false);
    }
  };
  const back = () => {
    if (saving.current) return;
    if (page === 'menu') onClose();
    else {
      setPage('menu');
      setMessage('');
      setPurchase('');
    }
  };
  const button = (
    label: string,
    onPress: () => void,
    selected = false,
    key = label,
  ) => (
    <Pressable
      key={key}
      accessibilityRole="button"
      accessibilityState={{ disabled: busy, selected }}
      disabled={busy}
      style={[styles.button, selected && styles.selected]}
      onPress={onPress}
    >
      <Text allowFontScaling style={styles.buttonText}>
        {label}
      </Text>
    </Pressable>
  );
  const field = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    numeric = false,
  ) => (
    <View style={styles.field}>
      <Text allowFontScaling style={styles.body}>
        {label}
      </Text>
      <TextInput
        allowFontScaling
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        editable={!busy}
        style={styles.input}
        keyboardType={numeric ? 'decimal-pad' : 'default'}
        maxLength={120}
      />
    </View>
  );
  const date = (value: string) =>
    new Date(value).toLocaleDateString(getLocale());
  const product = data.products.find(item => item.id === productId);
  const suppliers = data.suppliers ?? [],
    purchases = data.purchases ?? [],
    returns = data.returns ?? [];
  const titles: Record<Page, string> = {
    menu: t('More shop tools'),
    returns: t('Returns'),
    stock: t('Stock corrections'),
    daily: t('Daily closing summary'),
    statements: t('Customer statements'),
    suppliers: t('Suppliers & debts'),
  };
  let refund = 0;
  try {
    refund = returnPreview(data, lineId, parseQuantity(quantity)).refundCents;
  } catch {
    /* Preview is shown once the entry is valid. */
  }
  const products = () => (
    <>
      {data.products.length ? (
        data.products.map(item =>
          button(
            `${item.name} · ${item.quantity} ${item.unit}`,
            () => {
              setProduct(item.id);
              setCost(String(item.costCents / 100));
              setQuantity('');
            },
            productId === item.id,
            item.id,
          ),
        )
      ) : (
        <Text style={styles.hint}>{t('Add a product first.')}</Text>
      )}
    </>
  );
  return (
    <Modal visible animationType="slide" onRequestClose={back}>
      <SafeAreaView style={styles.screen}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.content}
          >
            <View style={styles.header}>
              <Text allowFontScaling style={[styles.screenTitle, styles.flex]}>
                {titles[page]}
              </Text>
              <Pressable
                accessibilityRole="button"
                disabled={busy}
                onPress={back}
                style={styles.backButton}
              >
                <Text allowFontScaling style={styles.backText}>
                  {t('Back')}
                </Text>
              </Pressable>
            </View>
            {!!message && (
              <Text
                allowFontScaling
                accessibilityLiveRegion="polite"
                style={styles.notice}
              >
                {message}
              </Text>
            )}
            {page === 'menu' && (
              <View style={styles.menuGroup}>
                {(
                  [
                    'returns',
                    'stock',
                    'daily',
                    'statements',
                    'suppliers',
                  ] as Page[]
                ).map((item, index) => (
                  <ShopNavigationRow
                    key={item}
                    title={titles[item]}
                    description={
                      [
                        t('Return items and record refunds'),
                        t('Fix shelf counts and record damaged items'),
                        t("Check and share one day's totals"),
                        t('Share purchases, payments and balances'),
                        t('Track stock bought on credit'),
                      ][index]
                    }
                    icon={item as ShopIcon}
                    last={index === 4}
                    disabled={busy}
                    onPress={() => {
                      setPage(item);
                      setMessage('');
                      setQuantity('');
                      setPaid('');
                    }}
                  />
                ))}
              </View>
            )}
            {page === 'returns' && (
              <>
                <Text allowFontScaling style={styles.hint}>
                  {t(
                    'Choose the original sale and item. Returns reduce customer debt first; any overpayment is refunded.',
                  )}
                </Text>
                {data.sales.map(item =>
                  button(
                    `${date(item.date)} · ${
                      data.customers.find(c => c.id === item.customerId)
                        ?.name ?? t('Walk-in')
                    } · ${money(item.totalCents)}`,
                    () => {
                      setSale(item.id);
                      setLine('');
                      setQuantity('');
                    },
                    saleId === item.id,
                    item.id,
                  ),
                )}
                {!data.sales.length && (
                  <Text style={styles.hint}>
                    {t('No sales to return yet.')}
                  </Text>
                )}
                {data.lines
                  .filter(item => item.saleId === saleId)
                  .map(item => {
                    const eligible =
                      item.quantity -
                      returns
                        .filter(r => r.lineId === item.id)
                        .reduce((sum, r) => sum + r.quantity, 0);
                    return button(
                      `${item.name} · ${eligible} ${t('can be returned')}`,
                      () => setLine(item.id),
                      lineId === item.id,
                      item.id,
                    );
                  })}
                {!!lineId && (
                  <>
                    {field(
                      t('Quantity to return'),
                      quantity,
                      setQuantity,
                      true,
                    )}
                    <View style={styles.row}>
                      <Text allowFontScaling style={[styles.body, styles.flex]}>
                        {t('Item can be sold again — put it back in stock')}
                      </Text>
                      <Switch
                        accessibilityLabel={t(
                          'Put returned items back in stock',
                        )}
                        value={restocked}
                        disabled={busy}
                        onValueChange={setRestocked}
                      />
                    </View>
                    <Text allowFontScaling style={styles.body}>
                      {t('Refund to customer')}: {money(refund)}
                    </Text>
                    <Text allowFontScaling style={styles.hint}>
                      {t(
                        'Give the shown refund to the customer before saving. Leave the switch off for damaged returned items.',
                      )}
                    </Text>
                    {button(t('Record return'), () =>
                      run(() =>
                        recordReturn(
                          lineId,
                          parseQuantity(quantity),
                          restocked,
                        ),
                      ),
                    )}
                  </>
                )}
                {returns
                  .slice()
                  .reverse()
                  .slice(0, 10)
                  .map(item => (
                    <Text key={item.id} style={styles.hint}>
                      {date(item.date)} ·{' '}
                      {data.lines.find(line => line.id === item.lineId)?.name} ×{' '}
                      {item.quantity} · {t('Refund')}: {money(item.refundCents)}
                    </Text>
                  ))}
              </>
            )}
            {page === 'stock' && (
              <>
                <Text allowFontScaling style={styles.hint}>
                  {t(
                    'Enter the quantity actually on your shelf. Missing or damaged items are recorded as a stock loss at their buying cost. Extra items do not count as sales.',
                  )}
                </Text>
                {products()}
                {!!product && (
                  <>
                    {field(
                      t('Actual quantity on shelf'),
                      quantity,
                      setQuantity,
                      true,
                    )}
                    {field(t('Reason'), reason, setReason)}
                    {button(t('Save stock correction'), () =>
                      run(() =>
                        correctStock(
                          productId,
                          parseQuantity(quantity),
                          reason,
                        ),
                      ),
                    )}
                  </>
                )}
                {(data.adjustments ?? [])
                  .slice()
                  .reverse()
                  .slice(0, 10)
                  .map(item => (
                    <Text key={item.id} style={styles.hint}>
                      {date(item.date)} ·{' '}
                      {data.products.find(p => p.id === item.productId)?.name} ·{' '}
                      {item.quantityDelta > 0 ? '+' : ''}
                      {item.quantityDelta} · {item.reason}
                    </Text>
                  ))}
              </>
            )}
            {page === 'daily' && (
              <>
                {field(t('Date (YYYY-MM-DD)'), day, setDay)}
                <Text allowFontScaling style={styles.body}>
                  {(() => {
                    try {
                      return dailyClosing(data, day);
                    } catch {
                      return t(
                        'Choose a valid date that is not in the future.',
                      );
                    }
                  })()}
                </Text>
                {button(t('Share daily summary'), () =>
                  run(async () => {
                    await Share.share({ message: dailyClosing(data, day) });
                  }, false),
                )}
              </>
            )}
            {page === 'statements' && (
              <>
                {data.customers.map(item =>
                  button(
                    item.name,
                    () => setCustomer(item.id),
                    customerId === item.id,
                    item.id,
                  ),
                )}
                {!data.customers.length && (
                  <Text style={styles.hint}>{t('Add a customer first.')}</Text>
                )}
                {!!customerId && (
                  <>
                    <Text allowFontScaling style={styles.body}>
                      {customerStatement(data, customerId)}
                    </Text>
                    {button(t('Share customer statement'), () =>
                      run(async () => {
                        await Share.share({
                          message: customerStatement(data, customerId),
                        });
                      }, false),
                    )}
                  </>
                )}
              </>
            )}
            {page === 'suppliers' && (
              <>
                <Text allowFontScaling style={styles.hint}>
                  {t(
                    'Record stock bought on credit and payments to suppliers. These purchases add stock; supplier payments do not reduce profit again.',
                  )}
                </Text>
                {field(t('Supplier name'), name, setName)}
                {field(t('Phone (optional)'), phone, setPhone)}
                {button(t('Add supplier'), () =>
                  run(async () => {
                    await addSupplier(name, phone);
                    setName('');
                    setPhone('');
                  }),
                )}
                {suppliers.map(item =>
                  button(
                    `${item.name} · ${t('You owe')}: ${money(
                      purchases
                        .filter(p => p.supplierId === item.id)
                        .reduce((sum, p) => sum + supplierOwed(data, p.id), 0),
                    )}`,
                    () => {
                      setSupplier(item.id);
                      setPurchase('');
                      setPaid('');
                    },
                    supplierId === item.id,
                    item.id,
                  ),
                )}
                {!!supplierId && (
                  <>
                    <Text allowFontScaling style={styles.title}>
                      {t('Record stock purchase')}
                    </Text>
                    {products()}
                    {!!product && (
                      <>
                        {field(
                          t('How many did you buy?'),
                          quantity,
                          setQuantity,
                          true,
                        )}
                        {field(
                          t('What did you pay for one? (ETB)'),
                          cost,
                          setCost,
                          true,
                        )}
                        {field(
                          t('Paid to supplier now (ETB)'),
                          paid,
                          setPaid,
                          true,
                        )}
                        <Text style={styles.hint}>
                          {t('Enter 0 if the whole purchase is on credit.')}
                        </Text>
                        {button(t('Save stock purchase'), () =>
                          run(() =>
                            purchaseStock(
                              supplierId,
                              productId,
                              parseQuantity(quantity),
                              parseMoney(cost),
                              parseMoney(paid),
                            ),
                          ),
                        )}
                      </>
                    )}
                    <Text allowFontScaling style={styles.title}>
                      {t('Purchase history & payments')}
                    </Text>
                    {purchases
                      .filter(item => item.supplierId === supplierId)
                      .map(item => (
                        <View key={item.id} style={styles.group}>
                          <Text allowFontScaling style={styles.body}>
                            {date(item.date)} ·{' '}
                            {
                              data.products.find(p => p.id === item.productId)
                                ?.name
                            }{' '}
                            × {item.quantity}
                          </Text>
                          <Text allowFontScaling style={styles.hint}>
                            {t('Purchase total')}: {money(item.totalCents)} ·{' '}
                            {t('You owe')}: {money(supplierOwed(data, item.id))}
                          </Text>
                          {(data.supplierPayments ?? [])
                            .filter(p => p.purchaseId === item.id)
                            .map(p => (
                              <Text key={p.id} style={styles.hint}>
                                {date(p.date)} · {t('Payment')}:{' '}
                                {money(p.amountCents)}
                              </Text>
                            ))}
                          {supplierOwed(data, item.id) > 0 &&
                            button(
                              t('Pay this purchase'),
                              () => {
                                setPurchase(item.id);
                                setPaymentAmount('');
                              },
                              purchaseId === item.id,
                            )}
                          {purchaseId === item.id && (
                            <>
                              {field(
                                t('Payment amount (ETB)'),
                                paymentAmount,
                                setPaymentAmount,
                                true,
                              )}
                              {button(t('Save supplier payment'), () =>
                                run(() =>
                                  paySupplier(
                                    item.id,
                                    parseMoney(paymentAmount),
                                  ),
                                ),
                              )}
                            </>
                          )}
                        </View>
                      ))}
                  </>
                )}
              </>
            )}
            {busy && (
              <Text accessibilityLiveRegion="polite" style={styles.hint}>
                {t('Please wait…')}
              </Text>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}
const C = theme.colors.iosSurface;
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000000' },
  flex: { flex: 1 },
  content: { padding: 20, paddingTop: 8, paddingBottom: 40, gap: 20 },
  header: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  screenTitle: {
    color: C.label,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
  },
  title: {
    color: C.label,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  backButton: { minHeight: 48, paddingHorizontal: 8, justifyContent: 'center' },
  backText: { color: theme.colors.iOS.blue, fontSize: 16, fontWeight: '500' },
  menuGroup: {
    backgroundColor: C.grouped1,
    borderRadius: 16,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  body: { color: C.label, fontSize: 16, lineHeight: 24 },
  hint: { color: C.label2, fontSize: 14, lineHeight: 21 },
  button: {
    minHeight: 48,
    padding: 14,
    borderRadius: 16,
    backgroundColor: C.grouped1,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selected: {
    borderColor: theme.colors.iOS.gold,
    backgroundColor: C.goldHighlight,
  },
  buttonText: { color: C.label, fontSize: 16 },
  input: {
    minHeight: 52,
    padding: 14,
    borderRadius: 12,
    backgroundColor: C.grouped1,
    color: C.label,
    fontSize: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.separator,
  },
  field: { gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  notice: { color: theme.colors.iOS.gold, fontSize: 15 },
  group: {
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.separator,
  },
});
