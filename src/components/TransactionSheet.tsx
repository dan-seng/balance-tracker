import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

import { AppText as Text } from './AppText';
import { SegmentedControl } from './SegmentedControl';
import { getBankCardTheme, getBankAbbrev } from './BankCard';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { Account, Transaction } from '../models';

const SHEET_HEIGHT_RATIO = 0.78;
const OPEN_DURATION = 280;
const CLOSE_DURATION = 220;
const DISMISS_FRACTION = 0.28;
const GREEN = '#30D158';
const RED = '#FF453A';
const LABEL2 = 'rgba(235, 235, 245, 0.60)';
const LABEL3 = 'rgba(235, 235, 245, 0.30)';
const GROUPED1 = '#1C1C1E';

const DOTS = ['#D8B45C', '#C9BB93', '#A98E4F', '#F0D38C', '#B9964A', '#E5C877'];

type TransactionSheetProps = {
  visible: boolean;
  account: Account | null;
  transactions: Transaction[];
  onClose: () => void;
};

type Segment = 'all' | 'income' | 'expense';

function dayLabel(date: Date): string {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const diffDays = Math.round(
    (startOfToday.getTime() - startOfDay.getTime()) / (24 * 60 * 60 * 1000),
  );

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays > 1 && diffDays < 7) {
    return date.toLocaleDateString(undefined, { weekday: 'long' });
  }
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

const fmt = (value: number) =>
  value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export function TransactionSheet({
  visible,
  account,
  transactions,
  onClose,
}: TransactionSheetProps) {
  const reduceMotion = useReducedMotion();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const sheetHeight = Math.round(height * SHEET_HEIGHT_RATIO);
  const translateY = useRef(new Animated.Value(sheetHeight)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const [isMounted, setIsMounted] = useState(visible);
  const [renderedAccount, setRenderedAccount] = useState<Account | null>(
    account,
  );
  const [segment, setSegment] = useState<Segment>('all');

  useEffect(() => {
    if (account) {
      setRenderedAccount(account);
    }
  }, [account]);

  useEffect(() => {
    if (visible) {
      setIsMounted(true);
      setSegment('all');
      const duration = reduceMotion ? 0 : OPEN_DURATION;
      const runOpen = () => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 0,
            duration,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(backdropOpacity, {
            toValue: 1,
            duration,
            useNativeDriver: true,
          }),
        ]).start();
      };

      if (reduceMotion) {
        runOpen();
        return;
      }

      // Let the Modal paint its first (offscreen) frame before animating,
      // otherwise the heavy blur + list mount and the animation fight on
      // the same frame and the sheet visibly "jumps" into place.
      const frame = requestAnimationFrame(runOpen);
      return () => cancelAnimationFrame(frame);
    }

    if (!isMounted) {
      return;
    }

    const duration = reduceMotion ? 0 : CLOSE_DURATION;
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: sheetHeight,
        duration,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setIsMounted(false);
      }
    });
  }, [
    visible,
    reduceMotion,
    sheetHeight,
    translateY,
    backdropOpacity,
    isMounted,
  ]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          gesture.dy > 6 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
        onPanResponderMove: (_, gesture) => {
          translateY.setValue(Math.max(0, gesture.dy));
        },
        onPanResponderRelease: (_, gesture) => {
          if (
            gesture.dy > sheetHeight * DISMISS_FRACTION ||
            gesture.vy > 0.9
          ) {
            onClose();
            return;
          }

          Animated.spring(translateY, {
            toValue: 0,
            bounciness: 4,
            useNativeDriver: true,
          }).start();
        },
      }),
    [translateY, sheetHeight, onClose],
  );

  const theme = getBankCardTheme(renderedAccount?.bankId ?? 'unknown');

  const income = transactions
    .filter(item => item.type === 'credit')
    .reduce((sum, item) => sum + item.amount, 0);
  const expense = transactions
    .filter(item => item.type === 'debit')
    .reduce((sum, item) => sum + item.amount, 0);

  const visibleTxns =
    segment === 'all'
      ? transactions
      : transactions.filter(item =>
          segment === 'income' ? item.type === 'credit' : item.type === 'debit',
        );

  const grouped: { label: string; items: Transaction[] }[] = useMemo(() => {
    const order: { label: string; items: Transaction[] }[] = [];
    for (const item of visibleTxns) {
      const date = new Date(item.date);
      const label = dayLabel(date);
      const group = order.find(entry => entry.label === label);
      if (group) {
        group.items.push(item);
      } else {
        order.push({ label, items: [item] });
      }
    }
    return order;
  }, [visibleTxns]);

  const segmentedIndex = segment === 'all' ? 0 : segment === 'income' ? 1 : 2;

  return (
    <Modal
      visible={isMounted}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}>
      <View style={styles.container}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="dark"
            blurAmount={10}
            blurRadius={14}
            overlayColor="rgba(0, 0, 0, 0.40)"
            reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.90)"
          />
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Dismiss transaction details"
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            {
              height: sheetHeight,
              paddingBottom: insets.bottom + 20,
              transform: [{ translateY }],
            },
          ]}>
          <View style={styles.dragRegion} {...panResponder.panHandlers}>
            <View style={styles.handle} />
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}>
            {renderedAccount && (
              <>
                <View style={styles.heroWrap}>
                  <LinearGradient
                    colors={[theme.color1, theme.color2]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.hero}>
                    <View style={styles.heroHeader}>
                      <Text style={styles.heroName} numberOfLines={1}>
                        {renderedAccount.bankName}
                      </Text>
                      <View style={styles.heroBadge}>
                        <Text style={styles.heroBadgeText}>
                          {transactions.length} TXNS
                        </Text>
                      </View>
                    </View>

                    <View style={styles.heroDots}>
                      {DOTS.map((color, index) => (
                        <View
                          key={index}
                          style={[styles.heroDot, { backgroundColor: color }]}
                        />
                      ))}
                    </View>

                    <View style={styles.heroBottomRow}>
                      <View>
                        <Text style={styles.heroBalanceLabel}>Balance</Text>
                        <Text style={styles.heroBalanceValue}>
                          ETB {fmt(renderedAccount.currentBalance)}
                        </Text>
                      </View>
                      <View style={styles.heroLogo}>
                        <Text style={styles.heroLogoText}>
                          {getBankAbbrev(renderedAccount.bankName)}
                        </Text>
                      </View>
                    </View>
                  </LinearGradient>
                </View>

                <View style={styles.statRow}>
                  <View style={styles.statCard}>
                    <View style={[styles.statIcon, styles.statIconCredit]}>
                      <Text style={styles.statArrowCredit}>↑</Text>
                    </View>
                    <View style={styles.statBody}>
                      <Text style={styles.statLabel}>In</Text>
                      <Text style={styles.statValueCredit}>
                        ETB {fmt(income)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.statCard}>
                    <View style={[styles.statIcon, styles.statIconDebit]}>
                      <Text style={styles.statArrowDebit}>↓</Text>
                    </View>
                    <View style={styles.statBody}>
                      <Text style={styles.statLabel}>Out</Text>
                      <Text style={styles.statValueDebit}>ETB {fmt(expense)}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.segmentWrap}>
                  <SegmentedControl
                    options={['All', 'Income', 'Expense']}
                    value={segmentedIndex}
                    onChange={index => {
                      setSegment(
                        index === 0
                          ? 'all'
                          : index === 1
                            ? 'income'
                            : 'expense',
                      );
                    }}
                    accessibilityLabel="Filter transactions"
                  />
                </View>

                {grouped.length === 0 ? (
                  <Text style={styles.emptyText}>
                    No transactions recorded yet.
                  </Text>
                ) : (
                  grouped.map(group => (
                    <View key={`${group.label}-header`} style={styles.daySection}>
                      <Text style={styles.dayLabel}>{group.label}</Text>
                      <View style={styles.dayCard}>
                        {group.items.map((transaction, index) => {
                          const isCredit = transaction.type === 'credit';
                          const isLast =
                            index === group.items.length - 1;

                          return (
                            <View
                              key={transaction.id}
                              style={[
                                styles.txnRow,
                                !isLast && styles.txnRowBorder,
                              ]}>
                              <View
                                style={[
                                  styles.txnIcon,
                                  isCredit
                                    ? styles.txnIconCredit
                                    : styles.txnIconDebit,
                                ]}>
                                <Text
                                  style={[
                                    styles.txnIconText,
                                    isCredit
                                      ? styles.txnIconTextCredit
                                      : styles.txnIconTextDebit,
                                  ]}>
                                  {isCredit ? '↑' : '↓'}
                                </Text>
                              </View>

                              <View style={styles.txnBody}>
                                <Text style={styles.txnTitle} numberOfLines={1}>
                                  {transaction.sender || 'Transaction'}
                                </Text>
                                <Text style={styles.txnSubline}>
                                  {new Date(transaction.date).toLocaleString()}
                                </Text>
                                {transaction.balanceAfter != null && (
                                  <Text style={styles.txnBalance}>
                                    Balance ETB {fmt(transaction.balanceAfter)}
                                  </Text>
                                )}
                              </View>

                              <Text
                                style={[
                                  styles.txnAmount,
                                  isCredit
                                    ? styles.txnAmountCredit
                                    : styles.txnAmountDebit,
                                ]}>
                                {isCredit ? '+' : '-'}ETB {fmt(transaction.amount)}
                              </Text>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  ))
                )}
              </>
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  sheet: {
    backgroundColor: '#000000',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    overflow: 'hidden',
  },
  dragRegion: {
    paddingTop: 10,
  },
  handle: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 999,
    height: 4,
    marginBottom: 4,
    width: 40,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 12,
  },
  heroWrap: {
    paddingHorizontal: 20,
  },
  hero: {
    borderRadius: 20,
    borderCurve: 'continuous',
    justifyContent: 'space-between',
    minHeight: 148,
    overflow: 'hidden',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  heroHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  heroName: {
    color: '#FFFFFF',
    flexShrink: 1,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  heroBadge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  heroBadgeText: {
    color: '#111114',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  heroDots: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 12,
  },
  heroDot: {
    borderRadius: 999,
    height: 3,
    opacity: 0.55,
    width: 12,
  },
  heroBottomRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  heroBalanceLabel: {
    color: 'rgba(235, 235, 245, 0.72)',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
  },
  heroBalanceValue: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.4,
    marginTop: 5,
  },
  heroLogo: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    height: 44,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 44,
  },
  heroLogoText: {
    color: '#111114',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  statRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
    paddingHorizontal: 20,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: GROUPED1,
    borderRadius: 12,
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 12,
  },
  statIcon: {
    alignItems: 'center',
    borderRadius: 999,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  statIconCredit: {
    backgroundColor: 'rgba(48, 209, 88, 0.16)',
  },
  statIconDebit: {
    backgroundColor: 'rgba(255, 69, 58, 0.16)',
  },
  statArrowCredit: {
    color: GREEN,
    fontSize: 15,
    fontWeight: '800',
  },
  statArrowDebit: {
    color: RED,
    fontSize: 15,
    fontWeight: '800',
  },
  statBody: {
    gap: 1,
  },
  statLabel: {
    color: 'rgba(235, 235, 245, 0.50)',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  statValueCredit: {
    color: GREEN,
    fontSize: 14,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  statValueDebit: {
    color: RED,
    fontSize: 14,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  segmentWrap: {
    marginTop: 16,
    paddingHorizontal: 20,
  },
  daySection: {
    marginTop: 18,
    paddingHorizontal: 20,
  },
  dayLabel: {
    color: LABEL2,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.4,
    marginBottom: 8,
    marginLeft: 4,
  },
  dayCard: {
    backgroundColor: GROUPED1,
    borderRadius: 14,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  txnRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  txnRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(84, 84, 88, 0.55)',
  },
  txnIcon: {
    alignItems: 'center',
    borderRadius: 999,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  txnIconCredit: {
    backgroundColor: 'rgba(48, 209, 88, 0.15)',
  },
  txnIconDebit: {
    backgroundColor: 'rgba(255, 69, 58, 0.15)',
  },
  txnIconText: {
    fontSize: 15,
    fontWeight: '800',
  },
  txnIconTextCredit: {
    color: GREEN,
  },
  txnIconTextDebit: {
    color: RED,
  },
  txnBody: {
    flex: 1,
  },
  txnTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  txnSubline: {
    color: LABEL3,
    fontSize: 11,
    marginTop: 2,
  },
  txnBalance: {
    color: LABEL3,
    fontSize: 10,
    marginTop: 2,
  },
  txnAmount: {
    fontSize: 14,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.2,
  },
  txnAmountCredit: {
    color: GREEN,
  },
  txnAmountDebit: {
    color: RED,
  },
  emptyText: {
    color: LABEL2,
    fontSize: 13,
    paddingVertical: 28,
    textAlign: 'center',
  },
});