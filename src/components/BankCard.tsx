import { getLocale } from '../i18n';
import { t } from '../i18n';
import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { AppText as Text } from './AppText';
import Svg, { Path, Circle, Line } from 'react-native-svg';

const EyeIcon = ({ size = 15, color = 'rgba(235,235,245,0.60)' }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <Circle cx="12" cy="12" r="3" />
  </Svg>
);

const EyeOffIcon = ({ size = 15, color = 'rgba(235,235,245,0.60)' }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
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
    buna: require('../../assets/images/buna.png'),
    sidama: require('../../assets/images/sidama.png'),
    siinqee: require('../../assets/images/Siinqee.png'),
    siket: require('../../assets/images/siket.png'),
    cooperative: require('../../assets/images/Cooperative Bank of Oromia Logo.png'),
    adis: require('../../assets/images/adisbank.png'),
    anbesa: require('../../assets/images/anbesabank.png'),
    chapa: require('../../assets/images/Chapa Logo.png'),
    oromia: require('../../assets/images/Oromia International Bank Logo.png'),
    tsedey: require('../../assets/images/tsedey.png'),
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
    color1: '#31479E',
    color2: '#1E2C61',
    card: '#1E2C61',
    accent: '#F7B359',
    chip: '#F7B359',
    textPrimary: '#FFFFFF',
    textSecondary: '#A2ACD3',
    badgeBg: '#FDF1E1',
    badgeText: '#1E2C61',
  },
  hibret: {
    color1: '#57DED3',
    color2: '#358982',
    card: '#358982',
    accent: '#57DED3',
    chip: '#91E9E2',
    textPrimary: '#FFFFFF',
    textSecondary: '#B3F0EB',
    badgeBg: '#E0F9F7',
    badgeText: '#358982',
  },
  abay: {
    color1: '#184C6B',
    color2: '#0E2F42',
    card: '#0E2F42',
    accent: '#184C6B',
    chip: '#688A9E',
    textPrimary: '#FFFFFF',
    textSecondary: '#97AEBC',
    badgeBg: '#D5DEE4',
    badgeText: '#0E2F42',
  },
  ahadu: {
    color1: '#6B1831',
    color2: '#420E1E',
    card: '#420E1E',
    accent: '#6B1831',
    chip: '#9E6879',
    textPrimary: '#FFFFFF',
    textSecondary: '#BC97A2',
    badgeBg: '#E4D5D9',
    badgeText: '#420E1E',
  },
  amhara: {
    color1: '#3159DE',
    color2: '#1E3789',
    card: '#1E3789',
    accent: '#DECD31',
    chip: '#DECD31',
    textPrimary: '#FFFFFF',
    textSecondary: '#A2B4F0',
    badgeBg: '#F9F6D9',
    badgeText: '#1E3789',
  },
  berhan: {
    color1: '#2053AB',
    color2: '#13336A',
    card: '#13336A',
    accent: '#2053AB',
    chip: '#6E8FC8',
    textPrimary: '#FFFFFF',
    textSecondary: '#9AB1D9',
    badgeBg: '#D6E0EF',
    badgeText: '#13336A',
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
    color1: '#9E3131',
    color2: '#611E1E',
    card: '#611E1E',
    accent: '#FFFFFF',
    chip: '#FFFFFF',
    textPrimary: '#FFFFFF',
    textSecondary: '#D3A2A2',
    badgeBg: '#FFFFFF',
    badgeText: '#611E1E',
  },
  buna: {
    color1: '#42131B',
    color2: '#280B10',
    card: '#280B10',
    accent: '#42131B',
    chip: '#84656A',
    textPrimary: '#FFFFFF',
    textSecondary: '#A99498',
    badgeBg: '#DCD4D5',
    badgeText: '#280B10',
  },

  anbesa: {
    color1: '#141414',
    color2: '#0C0C0C',
    card: '#0C0C0C',
    accent: '#D4AF37',
    chip: '#D4AF37',
    textPrimary: '#FFFFFF',
    textSecondary: '#959595',
    badgeBg: '#F7F0DB',
    badgeText: '#0C0C0C',
  },

  cooperative: {
    color1: '#1D95DB',
    color2: '#115C87',
    card: '#115C87',
    accent: '#FFFFFF',
    chip: '#FFFFFF',
    textPrimary: '#FFFFFF',
    textSecondary: '#99CFEE',
    badgeBg: '#FFFFFF',
    badgeText: '#115C87',
  },

  chapa: {
    color1: '#68F556',
    color2: '#409735',
    card: '#409735',
    accent: '#1E6B15',
    chip: '#1E6B15',
    textPrimary: '#FFFFFF',
    textSecondary: '#BBFAB2',
    badgeBg: '#D6E4D4',
    badgeText: '#409735',
  },

  sidama: {
    color1: '#56C5F5',
    color2: '#357A97',
    card: '#357A97',
    accent: '#1E7A3C',
    chip: '#1E7A3C',
    textPrimary: '#FFFFFF',
    textSecondary: '#B2E4FA',
    badgeBg: '#D6E7DB',
    badgeText: '#357A97',
  },

  siinqee: {
    color1: '#397539',
    color2: '#234823',
    card: '#234823',
    accent: '#C7E80F',
    chip: '#C7E80F',
    textPrimary: '#FFFFFF',
    textSecondary: '#A5C0A5',
    badgeBg: '#F4FAD3',
    badgeText: '#234823',
  },

  siket: {
    color1: '#3E4F4A',
    color2: '#26302D',
    card: '#26302D',
    accent: '#93A6A0',
    chip: '#93A6A0',
    textPrimary: '#FFFFFF',
    textSecondary: '#A8AFAD',
    badgeBg: '#EBEEED',
    badgeText: '#26302D',
  },

  adis: {
    color1: '#1D4ED8',
    color2: '#113085',
    card: '#113085',
    accent: '#F7C948',
    chip: '#F7C948',
    textPrimary: '#FFFFFF',
    textSecondary: '#99AFED',
    badgeBg: '#FDF5DE',
    badgeText: '#113085',
  },

  oromia: {
    color1: '#1E7A3C',
    color2: '#124B25',
    card: '#124B25',
    accent: '#F7C948',
    chip: '#F7C948',
    textPrimary: '#FFFFFF',
    textSecondary: '#99C3A7',
    badgeBg: '#FDF5DE',
    badgeText: '#124B25',
  },

  tsedey: {
    color1: '#3D806C',
    color2: '#254F42',
    card: '#254F42',
    accent: '#F7C948',
    chip: '#F7C948',
    textPrimary: '#FFFFFF',
    textSecondary: '#A7C5BC',
    badgeBg: '#FDF5DE',
    badgeText: '#254F42',
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
  return words
    .slice(0, 3)
    .map(word => word[0])
    .join('')
    .toUpperCase();
}

export function maskAccountNumber(accountNumber: string): string {
  const digits = /[*xX•●#]/.test(accountNumber)
    ? accountNumber.match(/\d+$/)?.[0] ?? ''
    : accountNumber.replace(/[^\d]/g, '');
  if (digits.length < 2) return '';
  return `•• ${digits.slice(-4)}`;
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
        <View key={index} style={[styles.dot, { backgroundColor: color }]} />
      ))}
    </View>
  );
}

const formatMoney = (value: number) =>
  value.toLocaleString(getLocale(), {
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
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <LinearGradient
        colors={[theme.color1, theme.color2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />

      <View style={styles.shine} />

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.bankName} numberOfLines={1}>
              {account.bankName}
            </Text>
            <Text style={styles.acctNumber} numberOfLines={1}>
              {maskAccountNumber(account.accountNumber)
                ? t('Account · {number}', {
                    number: maskAccountNumber(account.accountNumber),
                  })
                : t('Account number unavailable')}
            </Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {transactionCount} {t('TXNS')}{' '}
            </Text>
          </View>
        </View>

        <DotRow />

        <View style={styles.bottomRow}>
          <View>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>{t('Balance')}</Text>
              <Pressable onPress={onToggleBalanceHidden} hitSlop={10}>
                {isBalanceHidden ? <EyeOffIcon /> : <EyeIcon />}
              </Pressable>
            </View>
            <Text style={styles.balanceValue}>
              {isBalanceHidden
                ? '••••••••'
                : `${t('ETB')} ${formatMoney(account.currentBalance)}`}
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
  headerLeft: {
    flexShrink: 1,
    gap: 2,
  },
  bankName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  acctNumber: {
    color: 'rgba(235, 235, 245, 0.66)',
    fontSize: 10,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.4,
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
