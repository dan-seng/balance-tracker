import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { AppText as Text } from './AppText';
import Svg, { Path, Circle, Line } from 'react-native-svg';

const EyeIcon = ({ size = 15, color = "rgba(235,235,245,0.60)" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <Circle cx="12" cy="12" r="3" />
  </Svg>
);

const EyeOffIcon = ({ size = 15, color = "rgba(235,235,245,0.60)" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <Line x1="1" y1="1" x2="23" y2="23" />
  </Svg>
);

import { Account } from '../models';

type BankCardProps = {
  account: Account;
  transactionCount: number;
  isBalanceHidden?: boolean;
  onToggleBalanceHidden?: () => void;
  onPress: () => void;
  customBankLogo?: string | null;
};

export type BankCardTheme = {
  color1: string;
  color2: string;
  card: string;
  accent: string;
  chip: string;
  textPrimary: string;
  textSecondary: string;
  badgeBg: string;
  badgeText: string;
};

export const getBankLogo = (bankId: Account['bankId']): any => {
  const logoMap: Record<Account['bankId'], any> = {
    cbe: require('../../assets/images/cbe.png'),
    cbebirr: require('../../assets/images/CBEBirr.png'),
    telebirr: require('../../assets/images/telebirr.png'),
    dashen: require('../../assets/images/DashenBank.png'),
    awash: require('../../assets/images/AwashInternationalBank.png'),
    wegagen: require('../../assets/images/wegagen.png'),
    boa: require('../../assets/images/boa.png'),
    hibret: require('../../assets/images/HibretBank.png'),
    abay: require('../../assets/images/abayBank.png'),
    ahadu: require('../../assets/images/ahadubank.png'),
    amhara: require('../../assets/images/AmharaBank.png'),
    berhan: require('../../assets/images/Berhan International Bank.png'),
    mpesa: require('../../assets/images/mpesa.png'),
    nib: require('../../assets/images/Nib_International_Bank.png'),
    zemen: require('../../assets/images/ZemenBank.png'),
    unknown: null,
  };
  return logoMap[bankId] || null;
};

const CARD_THEMES: Record<Account['bankId'], BankCardTheme> = {
  cbe: {
    color1: '#8A5CF0',
    color2: '#6640C4',
    card: '#6640C4',
    accent: '#8A5CF0',
    chip: '#B99BE0',
    textPrimary: '#FAF7FF',
    textSecondary: '#E6D8FB',
    badgeBg: '#E9DDFB',
    badgeText: '#47236F',
  },
  cbebirr: {
    color1: '#7B4FD1',
    color2: '#5E3AA8',
    card: '#5E3AA8',
    accent: '#7B4FD1',
    chip: '#C1A2EB',
    textPrimary: '#FBF8FF',
    textSecondary: '#E9DDFA',
    badgeBg: '#EFE4FF',
    badgeText: '#58258B',
  },
  telebirr: {
    color1: '#8ED33B',
    color2: '#5FAE1E',
    card: '#5FAE1E',
    accent: '#8ED33B',
    chip: '#F9FFF1',
    textPrimary: '#FFFFFF',
    textSecondary: '#DFF0C9',
    badgeBg: '#FFFFFF',
    badgeText: '#265437',
  },
  boa: {
    color1: '#F2BE2D',
    color2: '#B47A08',
    card: '#B47A08',
    accent: '#F2BE2D',
    chip: '#FFF0B0',
    textPrimary: '#FFFFFF',
    textSecondary: '#FCE8B8',
    badgeBg: '#FFFFFF',
    badgeText: '#7A5B00',
  },
  wegagen: {
    color1: '#E8893F',
    color2: '#C05621',
    card: '#C05621',
    accent: '#E8893F',
    chip: '#FFC8A3',
    textPrimary: '#FFFFFF',
    textSecondary: '#FFE1D1',
    badgeBg: '#FFE3D0',
    badgeText: '#8A3E12',
  },
  dashen: {
    color1: '#4E8DF3',
    color2: '#1759B8',
    card: '#1759B8',
    accent: '#4E8DF3',
    chip: '#A9C8F6',
    textPrimary: '#F7FBFF',
    textSecondary: '#D8E8FF',
    badgeBg: '#E4F0FF',
    badgeText: '#123D7F',
  },
  awash: {
    color1: '#3D9C8E',
    color2: '#1E6F62',
    card: '#1E6F62',
    accent: '#3D9C8E',
    chip: '#9EDDCF',
    textPrimary: '#F4FFFC',
    textSecondary: '#D4F3EB',
    badgeBg: '#DFF9F2',
    badgeText: '#11584A',
  },
  hibret: {
    color1: '#E23B57',
    color2: '#A1122D',
    card: '#A1122D',
    accent: '#E23B57',
    chip: '#FF7D9A',
    textPrimary: '#FFF3F6',
    textSecondary: '#FFCBD6',
    badgeBg: '#FFE0E8',
    badgeText: '#A10022',
  },
  abay: {
    color1: '#2B6CB0',
    color2: '#002855',
    card: '#002855',
    accent: '#2B6CB0',
    chip: '#4A90E2',
    textPrimary: '#FFFFFF',
    textSecondary: '#A9D6E5',
    badgeBg: '#01497C',
    badgeText: '#A9D6E5',
  },
  ahadu: {
    color1: '#B08968',
    color2: '#7F4F24',
    card: '#7F4F24',
    accent: '#B08968',
    chip: '#B08968',
    textPrimary: '#FFFFFF',
    textSecondary: '#EDE0D4',
    badgeBg: '#936639',
    badgeText: '#EDE0D4',
  },
  amhara: {
    color1: '#D1A53C',
    color2: '#8F6A1E',
    card: '#8F6A1E',
    accent: '#D1A53C',
    chip: '#F4A261',
    textPrimary: '#FFFFFF',
    textSecondary: '#F0E2C0',
    badgeBg: '#E76F51',
    badgeText: '#FFFFFF',
  },
  berhan: {
    color1: '#3A5A80',
    color2: '#1F4068',
    card: '#1F4068',
    accent: '#3A5A80',
    chip: '#E43F5A',
    textPrimary: '#FFFFFF',
    textSecondary: '#B9CDE8',
    badgeBg: '#1B1B2F',
    badgeText: '#E43F5A',
  },
  mpesa: {
    color1: '#22B573',
    color2: '#0E7C46',
    card: '#0E7C46',
    accent: '#22B573',
    chip: '#A3E4D7',
    textPrimary: '#FFFFFF',
    textSecondary: '#D4EFDF',
    badgeBg: '#1E8449',
    badgeText: '#D4EFDF',
  },
  nib: {
    color1: '#F0953F',
    color2: '#C66A1C',
    card: '#C66A1C',
    accent: '#F0953F',
    chip: '#FAD7A1',
    textPrimary: '#FFFFFF',
    textSecondary: '#FDEBD0',
    badgeBg: '#CA6F1E',
    badgeText: '#FDEBD0',
  },
  zemen: {
    color1: '#1D4E89',
    color2: '#01153E',
    card: '#01153E',
    accent: '#1D4E89',
    chip: '#FAF0E6',
    textPrimary: '#FFFFFF',
    textSecondary: '#D9D9D9',
    badgeBg: '#0B2545',
    badgeText: '#FFFFFF',
  },
  unknown: {
    color1: '#4A5D55',
    color2: '#22322B',
    card: '#22322B',
    accent: '#4A5D55',
    chip: '#7A978B',
    textPrimary: '#F4F8F6',
    textSecondary: '#C8D4CF',
    badgeBg: '#E3EBE7',
    badgeText: '#244034',
  },
};

export const getBankCardTheme = (bankId: Account['bankId']): BankCardTheme =>
  CARD_THEMES[bankId] ?? CARD_THEMES.unknown;

export function getBankAbbrev(bankName: string): string {
  const cleaned = bankName.replace(/[^A-Za-z0-9 ]/g, ' ').trim();
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'BK';
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return words.slice(0, 3).map(word => word[0]).join('').toUpperCase();
}

const DOT_COLORS = [
  '#D8B45C',
  '#C9BB93',
  '#A98E4F',
  '#F0D38C',
  '#B9964A',
  '#E5C877',
];

// Keep the dots subtle so they read as texture, not decoration bars.
function DotRow() {
  return (
    <View style={styles.dotRow}>
      {DOT_COLORS.map((color, index) => (
        <View
          key={index}
          style={[styles.dot, { backgroundColor: color }]}
        />
      ))}
    </View>
  );
}

const formatMoney = (value: number) =>
  value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export function BankCard({
  account,
  transactionCount,
  isBalanceHidden = false,
  onToggleBalanceHidden = () => {},
  onPress,
  customBankLogo,
}: BankCardProps) {
  const theme = getBankCardTheme(account.bankId);
  const logoUri = customBankLogo ?? getBankLogo(account.bankId) ?? null;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}>
      <LinearGradient
        colors={[theme.color1, theme.color2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />

      <View style={styles.shine} />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.bankName} numberOfLines={1}>
            {account.bankName}
          </Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {transactionCount} TXNS
            </Text>
          </View>
        </View>

        <DotRow />

        <View style={styles.bottomRow}>
          <View>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>Balance</Text>
              <Pressable
                onPress={onToggleBalanceHidden}
                hitSlop={10}>
                {isBalanceHidden ? (
                  <EyeOffIcon />
                ) : (
                  <EyeIcon />
                )}
              </Pressable>
            </View>
            <Text style={styles.balanceValue}>
              {isBalanceHidden
                ? '••••••••'
                : `ETB ${formatMoney(account.currentBalance)}`}
            </Text>
          </View>

          <View style={styles.logoBadge}>
            {logoUri ? (
              <Image
                source={logoUri}
                style={styles.logoImage}
                resizeMode="contain"
              />
            ) : (
              <Text style={styles.logoAbbrev}>
                {getBankAbbrev(account.bankName)}
              </Text>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    height: 182,
    overflow: 'hidden',
    padding: 20,
    position: 'relative',
    borderCurve: 'continuous',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  shine: {
    position: 'absolute',
    top: -70,
    right: -50,
    width: 190,
    height: 190,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  bankName: {
    flexShrink: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  badge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  badgeText: {
    color: '#111114',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  dotRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 10,
  },
  dot: {
    borderRadius: 999,
    height: 3,
    width: 12,
    opacity: 0.55,
  },
  bottomRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  balanceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  balanceLabel: {
    color: 'rgba(235, 235, 245, 0.72)',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
  },
  balanceValue: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginTop: 5,
    fontVariant: ['tabular-nums'],
  },
  logoBadge: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    height: 44,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 44,
  },
  logoImage: {
    height: 28,
    width: 34,
  },
  logoAbbrev: {
    color: '#111114',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
});