import { StyleSheet, View, Pressable } from 'react-native';
import { AppText as Text } from '../components/AppText';;
import { useState } from 'react';
import Svg, { Path, Circle, Line, Rect } from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';

const EyeIcon = ({ size = 18, color = "#D4AF37" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <Circle cx="12" cy="12" r="3" />
  </Svg>
);

const EyeOffIcon = ({ size = 18, color = "#D4AF37" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <Line x1="1" y1="1" x2="23" y2="23" />
  </Svg>
);

const LockIcon = ({ size = 18, color = "#8AA094" }) => (
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

const WalletIcon = ({ size = 20, color = "#D4AF37" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
    <Path d="M4 6v12a2 2 0 0 0 2 2h14v-4" />
    <Path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
  </Svg>
);

const BankIcon = ({ size = 20, color = "#D4AF37" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 21h18" />
    <Path d="M5 21V7l8-4 8 4v14" />
    <Path d="M17 21v-8.5a1.5 1.5 0 0 0-3 0V21" />
    <Path d="M9 21v-6" />
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
  isBalanceHidden: boolean;
  onToggleBalanceHidden: () => void;
  userTitle: string | null;
  customBanks: Array<{ bankId: string; bankName: string; senderId: string; logoBase64: string | null }>;
};

export function DashboardScreen({userName, onSelectAccount, accounts, transactions, onToggleLock, isAppLocked, isBalanceHidden, onToggleBalanceHidden, userTitle, customBanks}: DashboardScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [selectedBanks, setSelectedBanks] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });

  const totalBalance = accounts.reduce((sum, account) => sum + account.currentBalance, 0);
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
              {isAppLocked ? <LockIcon /> : <UnlockIcon />}
            </Pressable>
          </View>
        </View>

        <View style={styles.balanceCard}>
          <LinearGradient
            colors={['#1F1F1F', '#2A2A2A', '#1F1F1F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.balanceGradient}
          />
          <View style={styles.balanceGlow} />
          <View style={styles.balanceGlow2} />
          
          {/* Decorative gold border */}
          <View style={styles.goldBorder} />
          
          {/* Decorative corner accents */}
          <View style={styles.cornerAccentTopLeft} />
          <View style={styles.cornerAccentTopRight} />
          <View style={styles.cornerAccentBottomLeft} />
          <View style={styles.cornerAccentBottomRight} />
          
          <View style={styles.balanceHeader}>
            <View style={styles.balanceHeaderLeft}>
              <WalletIcon size={18} />
              <Text style={styles.balanceLabel}>Total combined balance</Text>
            </View>
            <View style={styles.balanceHeaderRight}>
              <View style={styles.accountBadge}>
                <BankIcon size={14} />
                <Text style={styles.accountBadgeText}>{accounts.length}</Text>
              </View>
              <Pressable onPress={() => onToggleBalanceHidden()} hitSlop={10} style={styles.eyeBtn}>
                {isBalanceHidden ? <EyeOffIcon /> : <EyeIcon />}
              </Pressable>
            </View>
          </View>
          
          <View style={styles.balanceRow}>
            <Text style={styles.balanceCurrency}>ETB</Text>
            <Text style={styles.balanceValue}>
              {isBalanceHidden ? '********' : Math.round(totalBalance).toLocaleString()}
            </Text>
            {!isBalanceHidden && <Text style={styles.balanceDecimals}>.00</Text>}
          </View>

          <Text style={styles.amharicLogo}>ሒሳብ</Text>

          {userTitle && (
            <Text style={styles.userTitle}>{userTitle} {userName}</Text>
          )}
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
            customBankLogo={customBanks.find(b => b.bankId === account.bankId)?.logoBase64}
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
    borderRadius: 10,
    overflow: 'hidden',
    padding: 20,
    position: 'relative',
    width: '100%',
    height: 200,
  },
  balanceGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  balanceGlow: {
    backgroundColor: '#D4AF37',
    borderRadius: 140,
    height: 180,
    opacity: 0.28,
    position: 'absolute',
    right: -40,
    top: -40,
    width: 180,
  },
  balanceGlow2: {
    backgroundColor: '#FFD700',
    borderRadius: 100,
    height: 120,
    opacity: 0.15,
    position: 'absolute',
    left: -30,
    bottom: -30,
    width: 120,
  },
  goldBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    borderRadius: 10,
    pointerEvents: 'none',
  },
  cornerAccentTopLeft: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 20,
    height: 20,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    borderTopLeftRadius: 4,
  },
  cornerAccentTopRight: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    borderTopRightRadius: 4,
  },
  cornerAccentBottomLeft: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    width: 20,
    height: 20,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    borderBottomLeftRadius: 4,
  },
  cornerAccentBottomRight: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 20,
    height: 20,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    borderBottomRightRadius: 4,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  balanceHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  accountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  accountBadgeText: {
    color: '#D4AF37',
    fontSize: 11,
    fontWeight: '700',
  },
  eyeBtn: {
    padding: 4,
    opacity: 0.8,
  },
  balanceLabel: {
    color: '#D4AF37',
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
    color: '#FFFFFF',
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
    color: '#D4AF37',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
    marginLeft: 3,
  },
  amharicLogo: {
    position: 'absolute',
    bottom: 18,
    right: 18,
    color: 'rgba(212, 175, 55, 0.67)',
    fontSize: 24,
    fontFamily: 'nokiapure',
  },
  userTitle: {
    position: 'absolute',
    bottom: 18,
    left: 18,
    color: 'rgba(212, 175, 55, 0.5)',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
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
