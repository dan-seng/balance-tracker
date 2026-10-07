import { t } from '../i18n';
import React, { forwardRef } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { AppText as Text } from './AppText';
import {
  getBankAbbrev,
  getBankCardTheme,
  getBankLogo,
  maskAccountNumber,
} from './BankCard';
import { Account } from '../models';

type BankChipProps = {
  account: Account;
  onPress: () => void;
  customBankLogo?: string | null;
};

export const BankChip = forwardRef<View, BankChipProps>(
  ({ account, onPress, customBankLogo }, ref) => {
    const { width } = useWindowDimensions();
    const contentWidth = width - 40;
    const chipWidth = Math.round((contentWidth - 36) / 4);

    const theme = getBankCardTheme(account.bankId);
    const logoUri = customBankLogo ?? getBankLogo(account.bankId) ?? null;
    const firstWord =
      account.bankName.trim().split(/\s+/)[0] || account.bankName;

    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={
          maskAccountNumber(account.accountNumber)
            ? t('{bank}, account ending in {digits}', {
                bank: account.bankName,
                digits: maskAccountNumber(account.accountNumber).replace(
                  /\D/g,
                  '',
                ),
              })
            : account.bankName
        }
        style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      >
        <View
          ref={ref}
          collapsable={false}
          style={[
            styles.iconWrap,
            {
              width: chipWidth,
              height: chipWidth,
              borderRadius: Math.round(chipWidth * 0.26),
            },
          ]}
        >
          <LinearGradient
            colors={[theme.color1, theme.color2]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.icon}
          >
            {logoUri ? (
              <Image
                source={logoUri}
                style={styles.logo}
                resizeMode="contain"
              />
            ) : (
              <Text style={styles.abbrev}>
                {getBankAbbrev(account.bankName)}
              </Text>
            )}
          </LinearGradient>
        </View>
        <Text style={styles.label} numberOfLines={1} ellipsizeMode="tail">
          {firstWord}
        </Text>
        {!!maskAccountNumber(account.accountNumber) && (
          <Text style={styles.acct} numberOfLines={1} ellipsizeMode="tail">
            {maskAccountNumber(account.accountNumber)}
          </Text>
        )}
      </Pressable>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },
  iconWrap: {
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  icon: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  logo: {
    height: '48%',
    width: '54%',
  },
  abbrev: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  label: {
    color: 'rgba(235, 235, 245, 0.60)',
    fontSize: 10.5,
    fontWeight: '500',
    marginTop: 7,
    textAlign: 'center',
    width: '100%',
  },
  acct: {
    color: 'rgba(235, 235, 245, 0.38)',
    fontSize: 9,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    marginTop: 2,
    textAlign: 'center',
    width: '100%',
  },
});
