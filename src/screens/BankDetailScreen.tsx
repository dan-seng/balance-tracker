import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText as Text } from '../components/AppText';;

import { BankCard } from '../components/BankCard';
import { SearchBar } from '../components/SearchBar';
import { FilterDrawer } from '../components/FilterDrawer';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });

  const credits = transactions
    .filter(item => item.type === 'credit')
    .reduce((sum, item) => sum + item.amount, 0);
  const debits = transactions
    .filter(item => item.type === 'debit')
    .reduce((sum, item) => sum + item.amount, 0);

  const filteredTransactions = transactions.filter(transaction => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      transaction.bankName.toLowerCase().includes(query) ||
      transaction.amount.toString().includes(query) ||
      transaction.rawSms.toLowerCase().includes(query) ||
      transaction.balanceAfter?.toString().includes(query)
    );
  });

  return (
    <Screen scrollable>
      <View style={styles.headerRow}>
        <Pressable onPress={onBack} style={styles.backButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <SearchBar onSearch={setSearchQuery} />
        <Pressable onPress={() => setIsFilterDrawerOpen(true)} style={styles.filterButton} hitSlop={10}>
          <Text style={styles.filterIcon}>≡</Text>
        </Pressable>
      </View>

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
        <Text style={styles.sectionHint}>{filteredTransactions.length}</Text>
      </View>

      <View style={styles.list}>
        {filteredTransactions.map(transaction => (
          <TransactionCard key={transaction.id} transaction={transaction} />
        ))}
      </View>

      <FilterDrawer
        visible={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        banks={[account.bankName]}
        selectedBanks={[]}
        onBankToggle={() => {}}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  backText: {
    color: '#D7FF74',
    fontSize: 15,
    fontWeight: '800',
  },
  filterButton: {
    backgroundColor: '#1A2A23',
    borderRadius: 999,
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterIcon: {
    color: '#8AA094',
    fontSize: 20,
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
