import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '../components/Screen';
import { TransactionCard } from '../components/TransactionCard';
import { Account, Transaction } from '../models';

type BankDetailScreenProps = {
  account: Account;
  transactions: Transaction[];
  onBack: () => void;
};

export function BankDetailScreen({
  account,
  transactions,
  onBack,
}: BankDetailScreenProps) {
  const credits = transactions
    .filter(item => item.type === 'credit')
    .reduce((sum, item) => sum + item.amount, 0);
  const debits = transactions
    .filter(item => item.type === 'debit')
    .reduce((sum, item) => sum + item.amount, 0);

  return (
    <Screen scrollable>
      <Pressable onPress={onBack} style={styles.backButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Text style={styles.backText}>← Back</Text>
      </Pressable>

      <View style={styles.hero}>
        <Text style={styles.bankName}>{account.bankName}</Text>
        <Text style={styles.accountNumber}>{account.accountNumber}</Text>
        <Text style={styles.balanceLabel}>Current balance</Text>
        <Text style={styles.balanceValue}>
          ETB {account.currentBalance.toLocaleString()}
        </Text>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.creditCard]}>
          <Text style={styles.statLabel}>Incoming</Text>
          <Text style={styles.statValue}>ETB {credits.toLocaleString()}</Text>
        </View>
        <View style={[styles.statCard, styles.debitCard]}>
          <Text style={styles.statLabel}>Outgoing</Text>
          <Text style={styles.statValue}>ETB {debits.toLocaleString()}</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Transactions</Text>
        <Text style={styles.sectionHint}>{transactions.length} items</Text>
      </View>

      <View style={styles.list}>
        {transactions.map(transaction => (
          <TransactionCard key={transaction.id} transaction={transaction} />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  backText: {
    color: '#D7FF74',
    fontSize: 15,
    fontWeight: '800',
  },
  hero: {
    backgroundColor: '#F1F1E7',
    borderRadius: 28,
    marginBottom: 20,
    padding: 26,
  },
  bankName: {
    color: '#122019',
    fontSize: 30,
    fontWeight: '800',
  },
  accountNumber: {
    color: '#5D7568',
    fontSize: 14,
    marginTop: 6,
  },
  balanceLabel: {
    color: '#587062',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 24,
    textTransform: 'uppercase',
  },
  balanceValue: {
    color: '#15231C',
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: -1,
    marginTop: 6,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    borderRadius: 20,
    flex: 1,
    padding: 18,
  },
  creditCard: {
    backgroundColor: '#1B2D24',
  },
  debitCard: {
    backgroundColor: '#3A241C',
  },
  statLabel: {
    color: '#AAB9B1',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  statValue: {
    color: '#F5F7F1',
    fontSize: 22,
    fontWeight: '800',
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#F5F7F1',
    fontSize: 22,
    fontWeight: '800',
  },
  sectionHint: {
    color: '#8AA094',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  list: {
    gap: 14,
  },
});
