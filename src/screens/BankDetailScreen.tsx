import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BankCard } from '../components/BankCard';
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

      <BankCard
        account={account}
        transactionCount={transactions.length}
        onPress={() => {}}
      />

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <View style={styles.statContent}>
            <View style={styles.statIcon}>
              <Text style={[styles.statIconText, styles.creditIconText]}>↑</Text>
            </View>
            <Text style={styles.statValue}>ETB {credits.toLocaleString()}</Text>
          </View>
        </View>
        <View style={styles.statCard}>
          <View style={styles.statContent}>
            <View style={styles.statIcon}>
              <Text style={[styles.statIconText, styles.debitIconText]}>↓</Text>
            </View>
            <Text style={styles.statValue}>ETB {debits.toLocaleString()}</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Transactions</Text>
        <Text style={styles.sectionHint}>{transactions.length}</Text>
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
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#122019',
    borderRadius: 16,
    height: 50,
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  statIcon: {
    backgroundColor: '#1A2A23',
    borderRadius: 999,
    height: 32,
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconText: {
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 16,
  },
  creditIconText: {
    color: '#6BDB93',
  },
  debitIconText: {
    color: '#FFB38A',
  },
  statValue: {
    color: '#dcdeddbc',
    fontSize: 10,
    fontWeight: '800',
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 24,
  },
  sectionTitle: {
    color: '#f5f7f1e3',
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
