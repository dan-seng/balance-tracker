import { t } from '../i18n';
import { parseMoney } from '../utils/shopUtils';
import { useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import {
  AppText as Text,
  AppTextInput as TextInput,
} from '../components/AppText';
import { Screen } from '../components/Screen';
import { DONATE_API_URL } from '../config';

const BLUE = '#0A84FF';
const LABEL2 = 'rgba(235, 235, 245, 0.60)';
const LABEL3 = 'rgba(235, 235, 245, 0.30)';
const GROUPED1 = '#1C1C1E';
const GROUPED2 = '#2C2C2E';
const SEPARATOR = 'rgba(84, 84, 88, 0.55)';
const MAX_AMOUNT = 100000;

const PRESETS = [50, 100, 200];

type SupportScreenProps = {
  onBack: () => void;
};

export function SupportScreen({ onBack }: SupportScreenProps) {
  const [preset, setPreset] = useState<number | null>(100);
  const [custom, setCustom] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const customSelected = preset === null;

  const startDonation = async () => {
    if (submitting) return;

    let amount: number;
    try {
      if (customSelected) {
        if (!custom.trim()) {
          Alert.alert(t('Error'), t('Enter an amount'));
          return;
        }
        amount = parseMoney(custom) / 100;
        if (amount <= 0) {
          Alert.alert(t('Error'), t('Enter an amount'));
          return;
        }
      } else {
        amount = preset;
      }
      if (amount > MAX_AMOUNT) {
        Alert.alert(t('Error'), t('That amount is too large.'));
        return;
      }
    } catch (err) {
      Alert.alert(
        t('Error'),
        err instanceof Error ? err.message : String(err),
      );
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(DONATE_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          txRef: `hisab-${Date.now().toString(36)}-${Math.random()
            .toString(36)
            .slice(2, 8)}`,
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data || typeof data.checkoutUrl !== 'string') {
        throw new Error(
          t(
            'Could not open the payment page. Check your connection and try again.',
          ),
        );
      }
      await Linking.openURL(data.checkoutUrl);
    } catch (err) {
      Alert.alert(
        t('Error'),
        err instanceof Error
          ? err.message
          : t(
              'Could not open the payment page. Check your connection and try again.',
            ),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const buttonLabel = submitting
    ? t('Opening payment…')
    : !customSelected && preset !== null
    ? t('Donate {amount} Birr', { amount: String(preset) })
    : customSelected && custom.trim()
    ? t('Donate {amount} Birr', { amount: custom.trim() })
    : t('Donate');

  return (
    <Screen scrollable>
      <View style={styles.container}>
        <Pressable onPress={onBack} hitSlop={10} style={styles.back}>
          <Text style={styles.backText}>{t('‹ Back')}</Text>
        </Pressable>

        <Text style={styles.title}>{t('Support the developer')}</Text>
        <Text style={styles.subtitle}>
          {t(
            'Hisab is free, with no ads and no data collection. If it helps you, support its development.',
          )}
        </Text>

        <Text style={styles.groupHeader}>{t('Choose an amount')}</Text>
        <View style={styles.presetRow}>
          {PRESETS.map(value => {
            const active = preset === value;
            return (
              <Pressable
                key={value}
                onPress={() => setPreset(value)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={[styles.preset, active && styles.presetActive]}
              >
                <Text
                  style={[
                    styles.presetText,
                    active && styles.presetTextActive,
                  ]}
                >
                  {t('{amount} Birr', { amount: String(value) })}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.group}>
          <Pressable
            style={styles.row}
            onPress={() => setPreset(null)}
            accessibilityRole="button"
            accessibilityState={{ selected: customSelected }}
          >
            <Text
              style={[
                styles.rowLabel,
                customSelected && styles.rowLabelActive,
              ]}
            >
              {t('Custom amount')}
            </Text>
            {customSelected && <Text style={styles.rowCheck}>✓</Text>}
          </Pressable>
          {customSelected && (
            <View style={styles.rowBorder}>
              <TextInput
                style={styles.customInput}
                value={custom}
                onChangeText={setCustom}
                placeholder={t('e.g. 150')}
                placeholderTextColor={LABEL3}
                keyboardType="numeric"
                autoFocus
                returnKeyType="done"
              />
            </View>
          )}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.donateButton,
            (pressed || submitting) && styles.donateButtonPressed,
          ]}
          onPress={startDonation}
          disabled={submitting}
          accessibilityRole="button"
        >
          <Text style={styles.donateButtonText}>{buttonLabel}</Text>
        </Pressable>

        <Text style={styles.note}>
          {t(
            'Pay securely with Telebirr, CBE Birr or card. You will leave the app briefly and can return anytime.',
          )}
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 8,
  },
  back: {
    alignSelf: 'flex-start',
    marginBottom: 18,
  },
  backText: {
    color: BLUE,
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  subtitle: {
    color: LABEL2,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 24,
    marginTop: 6,
  },
  groupHeader: {
    color: LABEL2,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  presetRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  preset: {
    alignItems: 'center',
    backgroundColor: GROUPED2,
    borderRadius: 999,
    flex: 1,
    paddingVertical: 12,
  },
  presetActive: {
    backgroundColor: '#FFFFFF',
  },
  presetText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  presetTextActive: {
    color: '#000000',
  },
  group: {
    backgroundColor: GROUPED1,
    borderRadius: 16,
    borderCurve: 'continuous',
    marginBottom: 28,
    overflow: 'hidden',
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    minHeight: 46,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rowLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
  rowLabelActive: {
    color: BLUE,
  },
  rowCheck: {
    color: BLUE,
    fontSize: 16,
    fontWeight: '700',
  },
  rowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: SEPARATOR,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  customInput: {
    backgroundColor: '#000000',
    borderColor: '#3A3A3C',
    borderRadius: 10,
    borderWidth: 1,
    color: '#FFFFFF',
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  donateButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingVertical: 15,
  },
  donateButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  donateButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
  note: {
    color: LABEL3,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 16,
    textAlign: 'center',
  },
});