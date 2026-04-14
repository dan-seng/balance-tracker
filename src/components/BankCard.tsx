import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Account } from '../models';

type BankCardProps = {
  account: Account;
  transactionCount: number;
  onPress: () => void;
};

export function BankCard({
  account,
  transactionCount,
  onPress,
}: BankCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [styles.card, pressed ? styles.cardPressed : null]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.bankName}>{account.bankName}</Text>
          <Text style={styles.accountNumber}>{account.accountNumber}</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{transactionCount} txns</Text>
        </View>
      </View>

      <Text style={styles.balanceLabel}>Current balance</Text>
      <Text style={styles.balanceValue}>
        ETB {account.currentBalance.toLocaleString()}
      </Text>
      <Text style={styles.footer}>Tap to view bank details</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F1F1E7',
    borderRadius: 24,
    padding: 22,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  bankName: {
    color: '#122019',
    fontSize: 20,
    fontWeight: '800',
  },
  accountNumber: {
    color: '#5D7568',
    fontSize: 13,
    marginTop: 4,
  },
  badge: {
    backgroundColor: '#DFF0B8',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: {
    color: '#274338',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  balanceLabel: {
    color: '#587062',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  balanceValue: {
    color: '#15231C',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginTop: 6,
  },
  footer: {
    color: '#456054',
    fontSize: 13,
    marginTop: 16,
  },
});
