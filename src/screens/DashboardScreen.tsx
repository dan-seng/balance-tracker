import { StyleSheet, View, Pressable } from 'react-native';
import { AppText as Text } from '../components/AppText';;
import { useState } from 'react';
import Svg, { Path, Circle, Line, Rect } from 'react-native-svg';

const EyeIcon = ({ size = 18, color = "#B8D69F" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <Circle cx="12" cy="12" r="3" />
  </Svg>
);

const EyeOffIcon = ({ size = 18, color = "#B8D69F" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <Line x1="1" y1="1" x2="23" y2="23" />
  </Svg>
);

const LockIcon = ({ size = 18, color = "#8AA094", locked = false }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </Svg>
);

const UnlockIcon = ({ size = 18, color = "#8AA094" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <Path d="M7 11V7a5 5 0 0 1 9.9-1" />
    <Path d="M16.9 7a5 5 0 0 0-9.9 1" />
  </Svg>
);

import { BankCard } from '../components/BankCard';
import { SearchBar } from '../components/SearchBar';
import { FilterDrawer } from '../components/FilterDrawer';
import { Screen } from '../components/Screen';
import { Account, Transaction } from '../models';

type DashboardScreenProps = {
  userName: string;
  onSelectAccount: (account: Account) => void;
  accounts: Account[];
  transactions: Transaction[];
  onToggleLock: () => void;
  isAppLocked: boolean;
};

export function DashboardScreen({userName, onSelectAccount, accounts, transactions, onToggleLock, isAppLocked}: DashboardScreenProps) {
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [selectedBanks, setSelectedBanks] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });

  const totalBalance = accounts.reduce((sum, account) => sum + account.currentBalance, 0);
  const weeklyDelta = creditsMinusDebits(transactions);
  const credits = transactions
    .filter(item => item.type === 'credit')
    .reduce((sum, item) => sum + item.amount, 0);
  const debits = transactions
    .filter(item => item.type === 'debit')
    .reduce((sum, item) => sum + item.amount, 0);

  const filteredAccounts = accounts.filter(account => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      account.bankName.toLowerCase().includes(query) ||
      account.accountNumber.toLowerCase().includes(query) ||
      account.currentBalance.toString().includes(query)
    );
  });

  const handleBankToggle = (bankName: string) => {
    setSelectedBanks(prev =>
      prev.includes(bankName)
        ? prev.filter(b => b !== bankName)
        : [...prev, bankName]
    );
  };

  const banks = Array.from(new Set(accounts.map(a => a.bankName)));

  return (
    <Screen scrollable>
      <View style={styles.hero}>
        <View style={styles.heroHeader}>
          <View style={styles.heroIdentity}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
            </View>
            <View>
              <Text style={styles.eyebrow}>Welcome back</Text>
              <Text style={styles.title}>Hello, {userName}</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <SearchBar onSearch={setSearchQuery} />
            <Pressable onPress={() => setIsFilterDrawerOpen(true)} style={styles.filterButton} hitSlop={10}>
              <Text style={styles.filterIcon}>≡</Text>
            </Pressable>
            <Pressable onPress={onToggleLock} style={styles.lockButton} hitSlop={10}>
              {isAppLocked ? <LockIcon locked={true} /> : <UnlockIcon />}
            </Pressable>
          </View>
        </View>

        <View style={styles.balanceCard}>
          <View style={styles.balanceGlow} />
          
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Total combined balance</Text>
            <Pressable onPress={() => setIsBalanceHidden(!isBalanceHidden)} hitSlop={10} style={styles.eyeBtn}>
              {isBalanceHidden ? <EyeOffIcon /> : <EyeIcon />}
            </Pressable>
          </View>
          
          <View style={styles.balanceRow}>
            <Text style={styles.balanceCurrency}>ETB</Text>
            <Text style={styles.balanceValue}>
              {isBalanceHidden ? '••••••••' : Math.round(totalBalance).toLocaleString()}
            </Text>
            {!isBalanceHidden && <Text style={styles.balanceDecimals}>.00</Text>}
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
        <Text style={styles.sectionHint}>{filteredAccounts.length} banks</Text>
      </View>

      <View style={styles.list}>
        {filteredAccounts.map(account => (
          <BankCard
            key={account.id}
            account={account}
            onPress={() => onSelectAccount(account)}
            transactionCount={transactions.filter(t => t.accountId === account.id).length}
          />
        ))}
      </View>

      <FilterDrawer
        visible={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        banks={banks}
        selectedBanks={selectedBanks}
        onBankToggle={handleBankToggle}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />
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
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
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
  lockButton: {
    backgroundColor: '#1A2A23',
    borderRadius: 999,
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
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
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eyeBtn: {
    padding: 4,
    opacity: 0.8,
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
