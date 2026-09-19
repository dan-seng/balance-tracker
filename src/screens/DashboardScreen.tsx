import { StyleSheet, View, Pressable, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText as Text } from '../components/AppText';
import { useMemo, useRef, useState } from 'react';
import type { ComponentProps, ComponentType } from 'react';
import Svg, { Path, Circle, Line, Rect } from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';

import { theme } from '../theme';

type LGProps = ComponentProps<typeof LinearGradient> & { type?: 'linear' | 'radial' };
const RadialGradient = LinearGradient as unknown as ComponentType<LGProps>;

const EyeIcon = ({ size = 16, color = "rgba(235,235,245,0.60)" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <Circle cx="12" cy="12" r="3" />
  </Svg>
);

const EyeOffIcon = ({ size = 16, color = "rgba(235,235,245,0.60)" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <Line x1="1" y1="1" x2="23" y2="23" />
  </Svg>
);

const WalletIcon = ({ size = 13, color = "#C9BB93" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Rect x="2" y="7" width="20" height="14" rx="2" />
    <Path d="M16 3v4M8 3v4" />
  </Svg>
);

const BankIcon = ({ size = 12, color = "#D8B45C" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 21h18" />
    <Path d="M5 21V9l7-6 7 6v12" />
    <Path d="M9 21v-6h6v6" />
  </Svg>
);

const ArrowIcon = ({ size = 14, color = "#30D158" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M7 17 17 7M8 7h9v9" />
  </Svg>
);

const ArrowDownIcon = ({ size = 14, color = "#FF453A" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M17 7 7 17M16 17H7V8" />
  </Svg>
);

import { BankChip } from '../components/BankChip';
import { BankCardMorph, ChipRect } from '../components/BankCardMorph';
import { CountUpNumber } from '../components/CountUpNumber';
import { SearchBar } from '../components/SearchBar';
import { TransactionSheet } from '../components/TransactionSheet';
import { Account, Transaction } from '../models';

type DashboardScreenProps = {
  userName: string;
  accounts: Account[];
  transactions: Transaction[];
  onToggleLock: () => void;
  isAppLocked: boolean;
  isBalanceHidden: boolean;
  onToggleBalanceHidden: () => void;
  accountBalanceHidden: Record<string, boolean>;
  onToggleAccountBalanceHidden: (accountId: string) => void;
  userTitle: string | null;
  customBanks: Array<{ bankId: string; bankName: string; senderId: string; logoBase64: string | null }>;
};

const GOLD = theme.colors.iosSurface;
const GROUPED1 = theme.colors.iosSurface.grouped1;

export function DashboardScreen({
  userName,
  accounts,
  transactions,
  isBalanceHidden,
  onToggleBalanceHidden,
  accountBalanceHidden,
  onToggleAccountBalanceHidden,
  userTitle,
  customBanks,
}: DashboardScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sheetAccount, setSheetAccount] = useState<Account | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [morph, setMorph] = useState<{ account: Account; fromRect: ChipRect | null } | null>(null);
  const chipRefs = useRef<Record<string, View | null>>({});
  const scrollY = useRef(new Animated.Value(0)).current;
  const [isScrolled, setIsScrolled] = useState(false);

  const navTitleOpacity = scrollY.interpolate({
    inputRange: [0, 8],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const navTitleTy = scrollY.interpolate({
    inputRange: [0, 8],
    outputRange: [6, 0],
    extrapolate: 'clamp',
  });
  const largeTitleOpacity = scrollY.interpolate({
    inputRange: [0, 40],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const largeTitleTy = scrollY.interpolate({
    inputRange: [0, 40],
    outputRange: [0, -6],
    extrapolate: 'clamp',
  });
  const largeTitleScale = scrollY.interpolate({
    inputRange: [0, 40],
    outputRange: [1, 0.94],
    extrapolate: 'clamp',
  });

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: true,
      listener: (event: { nativeEvent: { contentOffset: { y: number } } }) => {
        const y = event.nativeEvent.contentOffset.y;
        setIsScrolled(prev => (y > 6 ? (prev ? prev : true) : prev ? false : prev));
      },
    },
  );

  const totalBalance = accounts.reduce((sum, account) => sum + account.currentBalance, 0);
  const credits = transactions
    .filter(item => item.type === 'credit')
    .reduce((sum, item) => sum + item.amount, 0);
  const debits = transactions
    .filter(item => item.type === 'debit')
    .reduce((sum, item) => sum + item.amount, 0);

  const filteredAccounts = useMemo(() => {
    const txCountMap = new Map<string, number>();
    for (const t of transactions) {
      txCountMap.set(t.accountId, (txCountMap.get(t.accountId) ?? 0) + 1);
    }
    return accounts
      .filter(account => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
          account.bankName.toLowerCase().includes(query) ||
          account.accountNumber.toLowerCase().includes(query) ||
          account.currentBalance.toString().includes(query)
        );
      })
      .sort((a, b) => (txCountMap.get(b.id) ?? 0) - (txCountMap.get(a.id) ?? 0));
  }, [accounts, transactions, searchQuery]);

  const sheetTransactions = useMemo(() => {
    if (!sheetAccount) {
      return [];
    }

    return transactions
      .filter(item => item.accountId === sheetAccount.id)
      .sort(
        (left, right) =>
          new Date(right.date).getTime() - new Date(left.date).getTime(),
      )
      .slice(0, 20);
  }, [sheetAccount, transactions]);

  const handleOpenAccountSheet = (account: Account) => {
    setSheetAccount(account);
    setIsSheetOpen(true);
  };

  const handleCloseAccountSheet = () => {
    setIsSheetOpen(false);
  };

  const handleChipPress = (account: Account) => {
    const node = chipRefs.current[account.id];
    if (!node) {
      setMorph({ account, fromRect: null });
      return;
    }
    node.measureInWindow((x, y, width, height) => {
      setMorph({ account, fromRect: { x, y, width, height } });
    });
  };

  const handleMorphOpenTransactions = () => {
    const account = morph?.account;
    setMorph(null);
    if (account) {
      handleOpenAccountSheet(account);
    }
  };

  const ownerLine = [userTitle, userName].filter(Boolean).join(' ') || userName;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={[styles.navbar, isScrolled && styles.navbarScrolled]}>
        <View pointerEvents="none" style={styles.navTitleCenter}>
          <Animated.Text
            style={[styles.navTitle, { opacity: navTitleOpacity, transform: [{ translateY: navTitleTy }] }]}>
            Accounts
          </Animated.Text>
        </View>
        <LinearGradient
          colors={['#3A3D44', '#222327']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.avatarBtn}
        >
          <Text style={styles.avatarBtnText}>{userName.charAt(0).toUpperCase()}</Text>
        </LinearGradient>
      </View>

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.hero}>
          <Animated.View
            style={[
              styles.largeTitleWrap,
              {
                opacity: largeTitleOpacity,
                transform: [
                  { translateY: largeTitleTy },
                  { scale: largeTitleScale },
                ],
              },
            ]}>
            <Text style={styles.largeTitle}>Accounts</Text>
          </Animated.View>

          <View style={styles.greetRow}>
        <View style={styles.lines}>
          <Text style={styles.eyebrow}>Welcome back</Text>
          <Text style={styles.name}>Hello, {userName}</Text>
        </View>
        <View style={styles.actions}>
          <SearchBar onSearch={setSearchQuery} />
        </View>
      </View>

        <View style={styles.balanceCard}>
          <LinearGradient
            colors={[GOLD.goldHighlight, GOLD.goldMid, GOLD.goldDeep]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.balanceGradient}
          />

          <View pointerEvents="none" style={[styles.blob, styles.blobTop]}>
            <RadialGradient
              type="radial"
              colors={['rgba(216, 180, 92, 0.32)', 'rgba(216, 180, 92, 0)']}
              style={StyleSheet.absoluteFill}
            />
          </View>
          <View pointerEvents="none" style={[styles.blob, styles.blobBottom]}>
            <RadialGradient
              type="radial"
              colors={['rgba(216, 180, 92, 0.16)', 'rgba(216, 180, 92, 0)']}
              style={StyleSheet.absoluteFill}
            />
          </View>

          <View pointerEvents="none" style={styles.goldBorder} />

          <View style={styles.row1}>
            <View style={styles.heroLabel}>
              <WalletIcon size={13} />
              <Text style={styles.balanceLabel}>Total combined balance</Text>
            </View>
            <View style={styles.badges}>
              <View style={styles.pillCount}>
                <BankIcon size={12} />
                <Text style={styles.pillCountText}>{accounts.length}</Text>
              </View>
              <Pressable
                onPress={onToggleBalanceHidden}
                hitSlop={6}
                style={styles.eyeToggle}
                accessibilityRole="button"
                accessibilityLabel={isBalanceHidden ? 'Show balances' : 'Hide balances'}>
                {isBalanceHidden ? <EyeOffIcon size={15} /> : <EyeIcon size={15} />}
              </Pressable>
            </View>
          </View>

          <View style={styles.balanceRow}>
            {isBalanceHidden ? (
              <Text style={[styles.balanceValue, styles.balanceValueHidden]}>
                {totalBalance.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
            ) : (
              <CountUpNumber
                value={totalBalance}
                decimals={2}
                style={styles.balanceValue}
              />
            )}
            <Text style={styles.unit}>ETB</Text>
          </View>

          <View style={styles.row2}>
            <Text style={styles.ownerName}>{ownerLine.toUpperCase()}</Text>
            <Text style={styles.amharicLogo}>ሂሳብ</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, styles.statIconCredit]}>
              <ArrowIcon size={13} />
            </View>
            <View style={styles.statBody}>
              <Text style={styles.statLabel}>Income</Text>
              <CountUpNumber
                value={credits}
                decimals={2}
                style={styles.statValue}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.6}
                formatter={value =>
                  `ETB ${value.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                }
              />
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, styles.statIconDebit]}>
              <ArrowDownIcon size={13} />
            </View>
            <View style={styles.statBody}>
              <Text style={styles.statLabel}>Spent</Text>
              <CountUpNumber
                value={debits}
                decimals={2}
                style={styles.statValue}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.6}
                formatter={value =>
                  `ETB ${value.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                }
              />
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Bank accounts</Text>
          <Text style={styles.sectionHint}>
            {filteredAccounts.length} {filteredAccounts.length === 1 ? 'bank' : 'banks'}
          </Text>
        </View>

        <View style={styles.grid}>
          {filteredAccounts.map(account => (
            <BankChip
              key={account.id}
              ref={node => {
                if (node) {
                  chipRefs.current[account.id] = node;
                } else {
                  delete chipRefs.current[account.id];
                }
              }}
              account={account}
              customBankLogo={customBanks.find(b => b.bankId === account.bankId)?.logoBase64}
              onPress={() => handleChipPress(account)}
            />
          ))}
        </View>
      </View>
      </Animated.ScrollView>

      <BankCardMorph
        account={morph?.account ?? null}
        fromRect={morph?.fromRect ?? null}
        transactionCount={
          morph ? transactions.filter(t => t.accountId === morph.account.id).length : 0
        }
        isBalanceHidden={!!(morph && accountBalanceHidden[morph.account.id])}
        onToggleBalanceHidden={() => {
          if (morph) {
            onToggleAccountBalanceHidden(morph.account.id);
          }
        }}
        onClose={() => setMorph(null)}
        onOpenTransactions={handleMorphOpenTransactions}
      />

      <TransactionSheet
        visible={isSheetOpen}
        account={sheetAccount}
        transactions={sheetTransactions}
        onClose={handleCloseAccountSheet}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000ff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  navbar: {
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingBottom: 10,
    paddingHorizontal: 20,
    paddingTop: 8,
    position: 'relative',
    zIndex: 10,
  },
  navbarScrolled: {
    backgroundColor: 'rgba(20, 20, 22, 0.85)',
    borderColor: 'rgba(235, 235, 245, 0.08)',
  },
  navTitleCenter: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  navTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  hero: {
    paddingBottom: 18,
    paddingHorizontal: 20,
    paddingTop: 4,
    width: '100%',
  },
  largeTitleWrap: {
    transformOrigin: 'top left',
  },
  avatarBtn: {
    alignItems: 'center',
    borderRadius: 17,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  avatarBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  largeTitle: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.68,
    paddingBottom: 12,
    paddingTop: 2,
  },
  greetRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  lines: {
    flex: 1,
    minWidth: 0,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  eyebrow: {
    color: 'rgba(235, 235, 245, 0.60)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.44,
    textTransform: 'uppercase',
  },
  name: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 1,
  },
  balanceCard: {
    borderRadius: 26,
    borderCurve: 'continuous',
    overflow: 'hidden',
    paddingBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 22,
    position: 'relative',
    width: '100%',
  },
  balanceGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  blob: {
    borderRadius: 999,
    overflow: 'hidden',
    position: 'absolute',
  },
  blobTop: {
    height: 160,
    right: -35,
    top: -55,
    width: 160,
  },
  blobBottom: {
    bottom: -30,
    height: 110,
    right: 36,
    width: 110,
  },
  goldBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1,
    borderColor: 'rgba(216, 180, 92, 0.18)',
    borderRadius: 26,
  },
  row1: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroLabel: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  badges: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  pillCount: {
    alignItems: 'center',
    backgroundColor: 'rgba(216, 180, 92, 0.16)',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pillCountText: {
    color: '#D8B45C',
    fontSize: 11,
    fontWeight: '800',
  },
  eyeToggle: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 15,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  balanceLabel: {
    color: '#C9BB93',
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  balanceRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
    gap: 8,
    marginTop: 18,
    minHeight: 36,
  },
  balanceValue: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 0.6,
    fontVariant: ['tabular-nums'],
  },
  balanceValueHidden: {
    color: 'rgba(255, 255, 255, 0.0)',
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowRadius: 40,
    textShadowOffset: { width: 0, height: 0 },
  },
  unit: {
    color: 'rgba(235, 235, 245, 0.60)',
    fontSize: 14,
    fontWeight: '700',
  },
  row2: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  ownerName: {
    color: '#8A806A',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  amharicLogo: {
    color: '#D8B45C',
    fontFamily: 'nokiapure',
    fontSize: 19,
    opacity: 0.9,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
    marginTop: 20,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: GROUPED1,
    borderRadius: 16,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    padding: 12,
  },
  statIcon: {
    alignItems: 'center',
    borderRadius: 999,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  statIconCredit: {
    backgroundColor: 'rgba(48, 209, 88, 0.16)',
  },
  statIconDebit: {
    backgroundColor: 'rgba(255, 69, 58, 0.16)',
  },
  statBody: {
    flexShrink: 1,
    gap: 1,
    minWidth: 0,
  },
  statLabel: {
    color: 'rgba(235, 235, 245, 0.50)',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  sectionHint: {
    color: 'rgba(235, 235, 245, 0.50)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 96,
    rowGap: 22,
  },
});