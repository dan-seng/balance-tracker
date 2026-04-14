import { StyleSheet, Text, View } from 'react-native';

import { BankCard } from '../components/BankCard';
import { Screen } from '../components/Screen';
import { Account } from '../models';
import {
  getAccounts,
  getParsedSmsCount,
  getPortfolioBalance,
  getTransactions,
  getTransactionsForAccount,
} from '../services/mockDataService';

type DashboardScreenProps = {
  onSelectAccount: (account: Account) => void;
};

export function DashboardScreen({onSelectAccount}: DashboardScreenProps) {
  const accounts = getAccounts();
  const transactions = getTransactions();
  const totalBalance = getPortfolioBalance();
  const parsedSmsCount = getParsedSmsCount();
  const credits = transactions
    .filter(item => item.type === 'credit')
    .reduce((sum, item) => sum + item.amount, 0);
  const debits = transactions
    .filter(item => item.type === 'debit')
    .reduce((sum, item) => sum + item.amount, 0);

  return (
    <Screen scrollable>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Portfolio</Text>
        <Text style={styles.title}>All your bank balances in one place.</Text>
        <Text style={styles.subtitle}>
          Track each bank separately, then open any card to see transactions and
          message history.
        </Text>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total balance</Text>
          <Text style={styles.balanceValue}>
            ETB {totalBalance.toLocaleString()}
          </Text>
          <Text style={styles.balanceMeta}>
            {accounts.length} banks • {parsedSmsCount} parsed SMS messages
          </Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.creditCard]}>
          <Text style={styles.statLabel}>Money in</Text>
          <Text style={styles.statValue}>ETB {credits.toLocaleString()}</Text>
        </View>
        <View style={[styles.statCard, styles.debitCard]}>
          <Text style={styles.statLabel}>Money out</Text>
          <Text style={styles.statValue}>ETB {debits.toLocaleString()}</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Bank accounts</Text>
        <Text style={styles.sectionHint}>Tap any card</Text>
      </View>

      <View style={styles.list}>
        {accounts.map(account => (
          <BankCard
            key={account.id}
            account={account}
            onPress={() => onSelectAccount(account)}
            transactionCount={getTransactionsForAccount(account.id).length}
          />
        ))}
      </View>

      <View style={styles.footerCard}>
        <Text style={styles.footerTitle}>What comes next</Text>
        <Text style={styles.footerText}>
          Next we can replace this mock portfolio with SQLite-backed accounts and
          real bank-specific parsers.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: '#F1F1E7',
    borderRadius: 28,
    marginBottom: 20,
    padding: 26,
  },
  eyebrow: {
    color: '#4F6B5D',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  title: {
    color: '#122019',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  subtitle: {
    color: '#456054',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  balanceCard: {
    backgroundColor: '#15231C',
    borderRadius: 20,
    padding: 20,
  },
  balanceLabel: {
    color: '#8DA597',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  balanceValue: {
    color: '#F8FAF5',
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1,
    marginTop: 6,
  },
  balanceMeta: {
    color: '#9BB1A6',
    fontSize: 13,
    marginTop: 8,
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
  footerCard: {
    backgroundColor: '#E0EDC4',
    borderRadius: 20,
    marginTop: 24,
    padding: 22,
  },
  footerTitle: {
    color: '#193025',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
  },
  footerText: {
    color: '#355244',
    fontSize: 14,
    lineHeight: 21,
  },
});
