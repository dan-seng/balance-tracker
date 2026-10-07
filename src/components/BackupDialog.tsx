import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText as Text, AppTextInput as TextInput } from './AppText';
import { getLocale, t } from '../i18n';
import {
  backupError,
  BackupPreview,
  backupService,
  DataOperation,
} from '../services/backupService';
import { theme } from '../theme';

type Props = {
  mode: 'create' | 'restore';
  onClose: () => void;
  runOperation: DataOperation;
  onRestored: () => Promise<void>;
};
export function BackupDialog({
  mode,
  onClose,
  runOperation,
  onRestored,
}: Props) {
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [preview, setPreview] = useState<BackupPreview | null>(null);
  const [saveCurrent, setSaveCurrent] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const running = useRef(false);
  useEffect(() => () => backupService.cancel(), []);
  const close = () => {
    if (running.current) return;
    backupService.cancel();
    setPassword('');
    setConfirmation('');
    onClose();
  };
  const work = async (operation: () => Promise<void>) => {
    if (running.current) return;
    running.current = true;
    setBusy(true);
    setError('');
    try {
      await runOperation(operation);
    } catch (cause) {
      setError(backupError(cause));
    } finally {
      running.current = false;
      setBusy(false);
    }
  };
  const selectFile = () => {
    if (password.length < 8) {
      setError(t('Use a password with at least 8 characters.'));
      return;
    }
    if (mode === 'create' && password !== confirmation) {
      setError(t('The passwords do not match.'));
      return;
    }
    work(async () => {
      if (mode === 'create') {
        const saved = await backupService.create(password);
        if (!saved) return;
        setPassword('');
        setConfirmation('');
        onClose();
        Alert.alert(
          t('Backup saved'),
          t(
            'Keep the file and password safe. You need both to restore your records.',
          ),
        );
      } else {
        const next = await backupService.preview(password);
        if (next) setPreview(next);
      }
    });
  };
  const replace = () => {
    if (!preview) return;
    work(async () => {
      if (saveCurrent && !(await backupService.create(password))) return;
      await backupService.restore(preview.token);
      await onRestored();
      setPassword('');
      setPreview(null);
      onClose();
      Alert.alert(
        t('Backup restored'),
        t(
          'Your records are ready. Enable app lock again in Settings on this phone.',
        ),
      );
    });
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
            contentContainerStyle={styles.content}
          >
            <View style={styles.header}>
              <Text allowFontScaling style={[styles.title, styles.flex]}>
                {preview
                  ? t('Review backup')
                  : mode === 'create'
                  ? t('Create backup')
                  : t('Restore backup')}
              </Text>
              <Pressable
                accessibilityRole="button"
                disabled={busy}
                onPress={close}
                style={styles.button}
              >
                <Text allowFontScaling style={styles.gold}>
                  {t('Cancel')}
                </Text>
              </Pressable>
            </View>
            {preview ? (
              <>
                <Text allowFontScaling style={styles.body}>
                  {t('Created: {date}', {
                    date: new Date(preview.createdAt).toLocaleString(
                      getLocale(),
                    ),
                  })}
                </Text>
                <View style={styles.summary}>
                  {[
                    [t('Bank accounts'), preview.accounts],
                    [t('Transactions'), preview.transactions],
                    [t('Transaction reasons'), preview.transaction_notes ?? 0],
                    [t('Products'), preview.products],
                    [t('Returns'), preview.returns ?? 0],
                    [t('Stock corrections'), preview.adjustments ?? 0],
                    [t('Suppliers & debts'), preview.suppliers ?? 0],
                    [t('Purchase history & payments'), preview.purchases ?? 0],
                    [t('Customers'), preview.customers],
                    [t('Sales'), preview.sales],
                    [t('Expenses'), preview.expenses],
                    [t('Debt payments and sale payments'), preview.payments],
                  ].map(([label, count]) => (
                    <View style={styles.row} key={String(label)}>
                      <Text allowFontScaling style={[styles.body, styles.flex]}>
                        {label}
                      </Text>
                      <Text allowFontScaling style={styles.body}>
                        {count}
                      </Text>
                    </View>
                  ))}
                </View>
                <Text allowFontScaling style={styles.body}>
                  {t(
                    'Restoring replaces all bank records, Shop records and preferences on this phone. It does not merge them. Your SMS inbox is not changed.',
                  )}
                </Text>
                <Text allowFontScaling style={styles.body}>
                  {t(
                    'App lock will be turned off so you can set it up on this phone.',
                  )}
                </Text>
                <View style={styles.row}>
                  <Text allowFontScaling style={[styles.body, styles.flex]}>
                    {t('Back up my current records first')}
                  </Text>
                  <Switch
                    accessibilityLabel={t('Back up my current records first')}
                    value={saveCurrent}
                    disabled={busy}
                    onValueChange={setSaveCurrent}
                  />
                </View>
                {saveCurrent && (
                  <Text allowFontScaling style={styles.hint}>
                    {t(
                      'Choose where to save your current records. This safety copy uses the password you just entered. Cancelling the save will cancel replacement.',
                    )}
                  </Text>
                )}
              </>
            ) : (
              <>
                <Text allowFontScaling style={styles.body}>
                  {mode === 'create'
                    ? t(
                        'Save an encrypted file with bank records, products, sales, expenses, customer debts and preferences.',
                      )
                    : t(
                        'Enter the password used to create the backup, then choose the .hisab file. You will review it before any records change.',
                      )}
                </Text>
                <Text allowFontScaling style={styles.label}>
                  {t('Backup password')}
                </Text>
                <TextInput
                  allowFontScaling
                  accessibilityLabel={t('Backup password')}
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={256}
                  editable={!busy}
                />
                {mode === 'create' && (
                  <>
                    <Text allowFontScaling style={styles.label}>
                      {t('Confirm password')}
                    </Text>
                    <TextInput
                      allowFontScaling
                      accessibilityLabel={t('Confirm password')}
                      style={styles.input}
                      value={confirmation}
                      onChangeText={setConfirmation}
                      secureTextEntry
                      autoCapitalize="none"
                      autoCorrect={false}
                      maxLength={256}
                      editable={!busy}
                    />
                  </>
                )}
                <Text allowFontScaling style={styles.hint}>
                  {mode === 'create'
                    ? t(
                        'Use at least 8 characters. Hisab does not store this password and cannot recover it for you.',
                      )
                    : t(
                        'The file stays encrypted until you enter the correct password.',
                      )}
                </Text>
              </>
            )}
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
              onPress={preview ? replace : selectFile}
              style={[styles.primary, busy && styles.disabled]}
            >
              <Text allowFontScaling style={styles.primaryText}>
                {busy
                  ? t('Please wait…')
                  : preview
                  ? t('Replace my records')
                  : mode === 'create'
                  ? t('Choose where to save')
                  : t('Choose backup file')}
              </Text>
            </Pressable>
            {busy && (
              <Text
                allowFontScaling
                accessibilityLiveRegion="polite"
                style={styles.hint}
              >
                {t(
                  'Finish the file picker if it is open. Keep Hisab open until this operation finishes.',
                )}
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
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: 20, gap: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { color: C.label, fontSize: 24, fontWeight: '700' },
  body: { color: C.label, fontSize: 16, lineHeight: 24 },
  hint: { color: C.label2, fontSize: 14, lineHeight: 21 },
  label: { color: C.label, fontSize: 15 },
  input: {
    backgroundColor: C.grouped1,
    color: C.label,
    fontSize: 16,
    borderRadius: 12,
    minHeight: 52,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  button: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 12 },
  gold: { color: theme.colors.iOS.gold, fontSize: 16 },
  primary: {
    backgroundColor: theme.colors.iOS.gold,
    padding: 16,
    borderRadius: 12,
    minHeight: 48,
  },
  primaryText: {
    color: C.goldMid,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  disabled: { opacity: 0.5 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  summary: {
    padding: 16,
    gap: 12,
    borderRadius: 16,
    backgroundColor: C.grouped1,
  },
  error: { color: theme.colors.iOS.red, fontSize: 15, lineHeight: 22 },
});
