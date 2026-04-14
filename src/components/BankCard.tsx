import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { Account } from '../models';

type BankCardProps = {
  account: Account;
  transactionCount: number;
  onPress: () => void;
};

type BankCardTheme = {
  card: string;
  accent: string;
  chip: string;
  textPrimary: string;
  textSecondary: string;
  badgeBg: string;
  badgeText: string;
};

const getBankLogo = (bankId: Account['bankId']): any => {
  const logoMap: Record<Account['bankId'], any> = {
    cbe: require('../../assets/images/cbe.png'),
    cbebirr: require('../../assets/images/CBEBirr.png'),
    telebirr: require('../../assets/images/telebirr.png'),
    dashen: require('../../assets/images/DashenBank.png'),
    awash: require('../../assets/images/AwashInternationalBank.png'),
    wegagen: require('../../assets/images/wegagen.png'),
    boa: require('../../assets/images/boa.png'),
    unknown: null,
  };
  return logoMap[bankId] || null;
};

const CARD_THEMES: Record<Account['bankId'], BankCardTheme> = {
  cbe: {
    card: '#5C2E91',
    accent: '#8E63C4',
    chip: '#B99BE0',
    textPrimary: '#FAF7FF',
    textSecondary: '#E6D8FB',
    badgeBg: '#E9DDFB',
    badgeText: '#47236F',
  },
  cbebirr: {
    card: '#6E2FB0',
    accent: '#9D68DB',
    chip: '#C1A2EB',
    textPrimary: '#FBF8FF',
    textSecondary: '#E9DDFA',
    badgeBg: '#EFE4FF',
    badgeText: '#58258B',
  },
  telebirr: {
    card: '#91e32c',
    accent: '#f9fcf5',
    chip: '#F9FFF1',
    textPrimary: '#e7e8e7f6',
    textSecondary: '#32513A',
    badgeBg: '#FFFFFF',
    badgeText: '#265437',
  },
  boa: {
    card: '#D9A515',
    accent: '#F0C74C',
    chip: '#FFE8A0',
    textPrimary: '#2E2100',
    textSecondary: '#5F4710',
    badgeBg: '#FFF6D8',
    badgeText: '#7A5B00',
  },
  wegagen: {
    card: '#D96A24',
    accent: '#F39B63',
    chip: '#FFC8A3',
    textPrimary: '#FFF8F4',
    textSecondary: '#FFE1D1',
    badgeBg: '#FFE3D0',
    badgeText: '#8A3E12',
  },
  dashen: {
    card: '#1759B8',
    accent: '#5B97E8',
    chip: '#A9C8F6',
    textPrimary: '#F7FBFF',
    textSecondary: '#D8E8FF',
    badgeBg: '#E4F0FF',
    badgeText: '#123D7F',
  },
  awash: {
    card: '#19826C',
    accent: '#52B29D',
    chip: '#9EDDCF',
    textPrimary: '#F4FFFC',
    textSecondary: '#D4F3EB',
    badgeBg: '#DFF9F2',
    badgeText: '#11584A',
  },
  unknown: {
    card: '#22322B',
    accent: '#456054',
    chip: '#7A978B',
    textPrimary: '#F4F8F6',
    textSecondary: '#C8D4CF',
    badgeBg: '#E3EBE7',
    badgeText: '#244034',
  },
};

export function BankCard({
  account,
  transactionCount,
  onPress,
}: BankCardProps) {
  const theme = CARD_THEMES[account.bankId] ?? CARD_THEMES.unknown;

  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [
        styles.card,
        { backgroundColor: theme.card },
        pressed ? styles.cardPressed : null,
      ]}>
      <View
        pointerEvents="none"
        style={[styles.orbLarge, { backgroundColor: theme.accent }]}
      />
      <View
        pointerEvents="none"
        style={[styles.orbSmall, { backgroundColor: theme.chip }]}
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.bankName, { color: theme.textPrimary }]}>
            {account.bankName}
          </Text>
          <View style={[styles.badge, { backgroundColor: theme.badgeBg }]}>
            <Text style={[styles.badgeText, { color: theme.badgeText }]}>
              {transactionCount} TXNS
            </Text>
          </View>
        </View>

        <View style={styles.cardNumber}>
          <Text style={[styles.cardNumberText, { color: theme.textPrimary }]}>
            {account.accountNumber}
          </Text>
        </View>

        <View style={styles.bottomRow}>
          <View>
            <Text style={[styles.cardHolderLabel, { color: theme.textSecondary }]}>
              BALANCE
            </Text>
            <Text style={[styles.balanceValue, { color: theme.textPrimary }]}>
              ETB {account.currentBalance.toLocaleString()}
            </Text>
          </View>

          <View style={styles.brandBlock}>
            {getBankLogo(account.bankId) ? (
              <Image
                source={getBankLogo(account.bankId)}
                style={styles.bankLogo}
                resizeMode="contain"
              />
            ) : (
              <View style={[styles.brandChip, { backgroundColor: theme.chip }]} />
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    height: 180,
    overflow: 'hidden',
    padding: 22,
    position: 'relative',
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  orbLarge: {
    borderRadius: 999,
    height: 180,
    opacity: 0.24,
    position: 'absolute',
    right: -50,
    top: -40,
    width: 210,
  },
  orbSmall: {
    borderRadius: 999,
    bottom: 20,
    height: 76,
    opacity: 0.28,
    position: 'absolute',
    right: 20,
    width: 76,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 4,
    paddingBottom: 4,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bankName: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardNumber: {
    marginTop: 12,
  },
  cardNumberText: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 2,
  },
  bottomRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  cardHolderLabel: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  balanceValue: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  brandBlock: {
    alignItems: 'flex-end',
    gap: 6,
  },
  bankLogo: {
    height: 50,
    width: 70,
  },
  brandChip: {
    borderRadius: 999,
    height: 22,
    width: 38,
  },
  brandText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  badgeText: {
    fontSize: 5,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
