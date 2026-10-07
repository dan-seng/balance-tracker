import { useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText as Text, AppTextInput as TextInput } from './AppText';
import { Transaction } from '../models';
import { getLocale, t } from '../i18n';
import { money } from '../utils/shopUtils';
import { theme } from '../theme';
type Props = {
  transactions: Transaction[];
  onSave: (hash: string, reason: string) => Promise<void>;
};
export function RecentTransactions({ transactions, onSave }: Props) {
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState<Transaction | null>(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const saving = useRef(false);
  const recent = [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10);
  const close = () => {
    if (!saving.current) {
      Keyboard.dismiss();
      setSelected(null);
      setReason('');
      setError('');
    }
  };
  const save = async () => {
    if (!selected || saving.current) return;
    saving.current = true;
    setBusy(true);
    setError('');
    try {
      await onSave(selected.hash, reason);
      Keyboard.dismiss();
      setSelected(null);
      setReason('');
    } catch {
      setError(
        t('Could not save the reason. Your text is still here; try again.'),
      );
    } finally {
      saving.current = false;
      setBusy(false);
    }
  };
  const stamp = (date: string) =>
    new Date(date).toLocaleString(getLocale(), {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  return (
    <>
      <View style={styles.section}>
        <Text allowFontScaling style={styles.heading}>
          {t('Recent transactions')}
        </Text>
        <Text allowFontScaling style={styles.hint}>
          {t('Latest 10 in this report. Tap one to add or edit its reason.')}
        </Text>
        <View style={styles.group}>
          {recent.length ? (
            (showAll ? recent : recent.slice(0, 3)).map((item, index) => (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityLabel={t('Edit reason for {bank}, {amount}', {
                  bank: item.bankName,
                  amount: money(item.amount * 100),
                })}
                onPress={() => {
                  setSelected(item);
                  setReason(item.reason ?? '');
                  setError('');
                }}
                style={({ pressed }) => [
                  styles.row,
                  index < recent.length - 1 && styles.separator,
                  pressed && styles.dim,
                ]}
              >
                <View style={styles.flex}>
                  <Text allowFontScaling style={styles.bank}>
                    {item.bankName} ·{' '}
                    {item.type === 'credit' ? t('Income') : t('Expense')}
                  </Text>
                  <Text allowFontScaling style={styles.hint}>
                    {stamp(item.date)}
                  </Text>
                  <Text
                    allowFontScaling
                    numberOfLines={2}
                    style={item.reason ? styles.reason : styles.add}
                  >
                    {item.reason || t('＋ Add reason')}
                  </Text>
                </View>
                <Text
                  allowFontScaling
                  style={[
                    styles.amount,
                    {
                      color:
                        item.type === 'credit'
                          ? theme.colors.iOS.green
                          : theme.colors.iOS.red,
                    },
                  ]}
                >
                  {item.type === 'credit' ? '+' : '−'}
                  {money(item.amount * 100)}
                </Text>
              </Pressable>
            ))
          ) : (
            <Text allowFontScaling style={styles.empty}>
              {t('No transactions in this report yet.')}
            </Text>
          )}
        </View>
        {recent.length > 3 && (
          <Pressable
            accessibilityRole="button"
            style={styles.link}
            onPress={() => setShowAll(value => !value)}
          >
            <Text style={styles.add}>
              {showAll ? t('Show fewer') : t('Show all recent transactions')}
            </Text>
          </Pressable>
        )}
      </View>
      {selected && (
        <Modal visible animationType="slide" onRequestClose={close}>
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
                  <Text allowFontScaling style={[styles.title, styles.flex]}>
                    {t('Transaction reason')}
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    disabled={busy}
                    onPress={close}
                    style={styles.link}
                  >
                    <Text style={styles.add}>{t('Cancel')}</Text>
                  </Pressable>
                </View>
                <Text allowFontScaling style={styles.bank}>
                  {selected.bankName} · {money(selected.amount * 100)}
                </Text>
                <Text allowFontScaling style={styles.hint}>
                  {stamp(selected.date)}
                </Text>
                <Text allowFontScaling style={styles.reason}>
                  {t(
                    'Write what this transaction was for. Leave it blank to remove the reason.',
                  )}
                </Text>
                <Text allowFontScaling style={styles.bank}>
                  {t('Reason')}
                </Text>
                <TextInput
                  allowFontScaling
                  accessibilityLabel={t('Reason')}
                  value={reason}
                  onChangeText={setReason}
                  multiline
                  textAlignVertical="top"
                  maxLength={200}
                  editable={!busy}
                  style={styles.input}
                  placeholder={t(
                    'For example: lunch, rent, or a customer payment',
                  )}
                  placeholderTextColor={theme.colors.iosSurface.label2}
                  autoFocus
                />
                <Text style={styles.hint}>{reason.length} / 200</Text>
                {!!error && (
                  <Text
                    allowFontScaling
                    accessibilityRole="alert"
                    style={styles.error}
                  >
                    {error}
                  </Text>
                )}
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ disabled: busy }}
                  disabled={busy}
                  onPress={save}
                  style={[styles.save, busy && styles.dim]}
                >
                  <Text style={styles.saveText}>
                    {busy ? t('Saving…') : t('Save reason')}
                  </Text>
                </Pressable>
              </ScrollView>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </Modal>
      )}
    </>
  );
}
const C = theme.colors.iosSurface;
const styles = StyleSheet.create({
  flex: { flex: 1 },
  section: { marginTop: 24, gap: 10 },
  heading: { color: C.label, fontSize: 20, fontWeight: '800' },
  hint: { color: C.label2, fontSize: 12, lineHeight: 18 },
  group: { backgroundColor: C.grouped1, borderRadius: 16, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    minHeight: 64,
  },
  separator: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.separator,
  },
  bank: { color: C.label, fontSize: 15, fontWeight: '600' },
  amount: {
    fontSize: 15,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    flexShrink: 1,
  },
  reason: { color: C.label, fontSize: 14, lineHeight: 21 },
  add: { color: theme.colors.iOS.gold, fontSize: 14 },
  empty: { color: C.label2, padding: 16, fontSize: 14 },
  screen: { flex: 1, backgroundColor: '#000000' },
  content: { padding: 20, gap: 16 },
  header: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  title: { color: C.label, fontSize: 24, fontWeight: '800' },
  link: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 8 },
  input: {
    minHeight: 140,
    padding: 16,
    borderRadius: 12,
    color: C.label,
    fontSize: 16,
    backgroundColor: C.grouped1,
  },
  error: { color: theme.colors.iOS.red, fontSize: 14 },
  save: {
    backgroundColor: theme.colors.iOS.gold,
    borderRadius: 16,
    padding: 16,
    minHeight: 48,
  },
  saveText: {
    color: C.goldMid,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  dim: { opacity: 0.55 },
});
