import { StyleSheet, Text, View } from 'react-native';

import { BankCard } from '../components/BankCard';
import { Screen } from '../components/Screen';
import { Account, Transaction } from '../models';

type DashboardScreenProps = {
  onSelectAccount: (account: Account) => void;
  accounts: Account[];
  transactions: Transaction[];
};

export function DashboardScreen({onSelectAccount, accounts, transactions}: DashboardScreenProps) {
  const totalBalance = accounts.reduce((sum, account) => sum + account.currentBalance, 0);
  const weeklyDelta = creditsMinusDebits(transactions);
  const credits = transactions
    .filter(item => item.type === 'credit')
    .reduce((sum, item) => sum + item.amount, 0);
  const debits = transactions
    .filter(item => item.type === 'debit')
    .reduce((sum, item) => sum + item.amount, 0);

  return (
    <Screen scrollable>
      <View style={styles.hero}>
        <View style={styles.heroHeader}>
          <View style={styles.heroIdentity}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>D</Text>
            </View>
            <View>
              <Text style={styles.eyebrow}>Welcome back</Text>
              <Text style={styles.title}>Hello, Dan</Text>
            </View>
          </View>
          <View style={styles.alertButton}>
            <Text style={styles.alertIcon}>!</Text>
          </View>
        </View>

        <View style={styles.balanceCard}>
          <View style={styles.balanceGlow} />
          <Text style={styles.balanceLabel}>Total combined balance</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceCurrency}>ETB</Text>
            <Text style={styles.balanceValue}>
              {Math.round(totalBalance).toLocaleString()}
            </Text>
            <Text style={styles.balanceDecimals}>.00</Text>
          </View>

          <View style={styles.balancePill}>
            <Text style={styles.balancePillValue}>
              {weeklyDelta >= 0 ? '~ +' : '~ -'}
              {Math.abs(Math.round(weeklyDelta)).toLocaleString()}
            </Text>
            <Text style={styles.balanceMeta}>since last sync</Text>
          </View>
        </View>
      </View>

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
        <Text style={styles.sectionTitle}>Bank accounts</Text>
        <Text style={styles.sectionHint}>Tap any card</Text>
      </View>

      <View style={styles.list}>
        {accounts.map(account => (
          <BankCard
            key={account.id}
            account={account}
            onPress={() => onSelectAccount(account)}
            transactionCount={transactions.filter(t => t.accountId === account.id).length}
          />
        ))}
      </View>

      
    </Screen>
  );
}

function creditsMinusDebits(transactions: Transaction[]) {
  const credits = transactions
    .filter(item => item.type === 'credit')
    .reduce((sum, item) => sum + item.amount, 0);
  const debits = transactions
    .filter(item => item.type === 'debit')
    .reduce((sum, item) => sum + item.amount, 0);

  return credits - debits;
}

const styles = StyleSheet.create({
  hero: {
    marginBottom: 20,
    paddingTop: 20,
    width: '100%',
  },
  heroHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  heroIdentity: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
   
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: '#23314E',
    borderRadius: 16,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  avatarText: {
    color: '#DCE7F7',
    fontSize: 19,
    fontWeight: '800',
  },
  alertButton: {
    alignItems: 'center',
    borderColor: '#2E3D5E',
    borderRadius: 14,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  alertIcon: {
    color: '#E8EFF8',
    fontSize: 16,
    fontWeight: '800',
  },
  eyebrow: {
    color: '#8DA4C8',
    fontSize: 7,
    fontWeight: '700',
    letterSpacing: 1.6,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  title: {
    color: '#F7FBFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  balanceCard: {
    backgroundColor: '#2D6B39',
    borderRadius: 10,
    overflow: 'hidden',
    padding: 20,
    position: 'relative',
    width: '100%',
  },
  balanceGlow: {
    backgroundColor: '#8FD0A0',
    borderRadius: 140,
    height: 180,
    opacity: 0.28,
    position: 'absolute',
    right: -20,
    top: 20,
    width: 180,
  },
  balanceLabel: {
    color: '#B8D69F',
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  balanceRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    marginTop: 12,
  },
  balanceCurrency: {
    color: '#F2FAEB',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
    marginRight: 6,
  },
  balanceValue: {
    color: '#FFFFFF',
    fontSize: 46,
    fontWeight: '800',
    letterSpacing: -1.6,
  },
  balanceDecimals: {
    color: '#CFE5C3',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
    marginLeft: 3,
  },
  balancePill: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#3F8B47',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  balancePillValue: {
    color: '#CFF6AE',
    fontSize: 14,
    fontWeight: '800',
  },
  balanceMeta: {
    color: '#B8D69F',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#1d674266',
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
    justifyContent: 'center',
    gap: 8,
  },
  statIcon: {
    alignItems: 'center',
    backgroundColor: '#1A2A23',
    borderRadius: 999,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  statIconText: {
    fontSize: 16,
    lineHeight: 16,
  },
  creditIconText: {
    color: '#6BDB93',
  },
  debitIconText: {
    color: '#FFB38A',
  },
  statLabel: {
    color: '#8FA69A',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
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
