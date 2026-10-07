import { RecentTransactions } from '../components/RecentTransactions';
import { getLocale } from '../i18n';
import { t, useLanguage } from '../i18n';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { AppText as Text } from '../components/AppText';
import { CountUpNumber } from '../components/CountUpNumber';
import { SegmentedControl } from '../components/SegmentedControl';
import { DoughnutChart } from '../components/DoughnutChart';
import { Screen } from '../components/Screen';
import { Transaction } from '../models';
import {
  getInsights,
  getReportPeriod,
  shiftReportPeriod,
  InsightRange,
  SPEND_CATEGORY_COLORS,
} from '../utils/insightsUtils';

const BLUE = '#0A84FF';
const GREEN = '#30D158';
const RED = '#FF453A';
const GOLD = '#D8B45C';
const LABEL2 = 'rgba(235, 235, 245, 0.60)';
const LABEL3 = 'rgba(235, 235, 245, 0.30)';
const GROUPED1 = '#1C1C1E';
const HAIRLINE = 'rgba(84, 84, 88, 0.55)';

const RANGE_OPTIONS = ['Week', 'Month', 'Year'];
const RANGES: InsightRange[] = ['week', 'month', 'year'];
const CHART_HEIGHT = 104;

function compact(value: number): string {
  if (value >= 1000) {
    return t('{amount}k', {
      amount: (value / 1000).toFixed(1).replace(/\.0$/, ''),
    });
  }
  if (value >= 100) {
    return Math.round(value / 10) * 10 + '';
  }
  return Math.round(value) + '';
}

function fmt(value: number): string {
  return value.toLocaleString(getLocale(), {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function DeltaPill({ pct, isUp }: { pct: number; isUp: boolean }) {
  return (
    <View
      style={[
        styles.deltaPill,
        isUp ? styles.deltaPillRed : styles.deltaPillGreen,
      ]}
    >
      <Text
        style={[
          styles.deltaText,
          isUp ? styles.deltaTextRed : styles.deltaTextGreen,
        ]}
      >
        {isUp ? '↑' : '↓'} {pct}%
      </Text>
    </View>
  );
}

type AnalyticsScreenProps = {
  onReasonSave: (hash: string, reason: string) => Promise<void>;
  transactions: Transaction[];
};

export function AnalyticsScreen({
  transactions,
  onReasonSave,
}: AnalyticsScreenProps) {
  useLanguage();
  const [reference, setReference] = useState(Date.now());
  const [rangeIndex, setRangeIndex] = useState(0);
  const [selectedBar, setSelectedBar] = useState(6);

  const range = RANGES[rangeIndex];

  const insights = getInsights(transactions, range, reference);

  const { bars, maxBar, categories, merchants } = insights;
  const reportPeriod = getReportPeriod(range, reference);
  const canGoNext =
    getReportPeriod(range, reference).start < getReportPeriod(range).start;
  const isEmpty = insights.totalSpend === 0 && insights.totalIncome === 0;

  const handleRangeChange = (index: number) => {
    setRangeIndex(index);
    setSelectedBar(0);
    setReference(Date.now());
  };

  return (
    <Screen scrollable>
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('Analytics')}</Text>
          <Text style={styles.subtitle}>{t('Calendar reports')}</Text>
        </View>

        <View style={styles.segmentWrap}>
          <SegmentedControl
            options={RANGE_OPTIONS}
            value={rangeIndex}
            onChange={handleRangeChange}
            accessibilityLabel={t('Analytics range')}
          />
        </View>

        <View style={styles.periodNavigation}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('Previous period')}
            style={styles.periodButton}
            onPress={() => {
              setReference(value => shiftReportPeriod(range, value, -1));
              setSelectedBar(0);
            }}
          >
            <Text style={styles.periodArrow}>‹</Text>
          </Pressable>
          <View style={styles.periodCaption}>
            <Text style={styles.periodLabel}>{insights.periodLabel}</Text>
            <Text style={styles.periodHint}>
              {range === 'week'
                ? t('Monday–Sunday')
                : range === 'month'
                ? t('First to last day of the month')
                : t('January–December')}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('Next period')}
            accessibilityState={{ disabled: !canGoNext }}
            disabled={!canGoNext}
            style={[styles.periodButton, !canGoNext && styles.periodDisabled]}
            onPress={() => {
              setReference(value => shiftReportPeriod(range, value, 1));
              setSelectedBar(0);
            }}
          >
            <Text style={styles.periodArrow}>›</Text>
          </Pressable>
        </View>

        <View style={styles.totalCard}>
          <View style={styles.totalHeader}>
            <Text style={styles.cardTitle}>{t('Total spent')}</Text>
            {insights.delta && (
              <DeltaPill pct={insights.delta.pct} isUp={insights.delta.isUp} />
            )}
          </View>
          <View style={styles.totalValueRow}>
            <Text style={styles.totalCurrency}>{t('ETB')}</Text>
            <CountUpNumber
              value={insights.totalSpend}
              decimals={2}
              style={styles.totalValue}
            />
          </View>
          <Text style={styles.totalCaption}>
            {insights.spentPct != null
              ? t('{percent}% of income earned', {
                  percent: Math.round(insights.spentPct),
                })
              : t('No income recorded yet')}
          </Text>
        </View>

        {isEmpty ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>{t('Nothing to show yet')}</Text>
            <Text style={styles.emptyText}>
              {t(
                'Once bank messages land, spending builds itself into daily bars, a spend ring and top merchants.',
              )}
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t(insights.barsTitle)}</Text>
              <View style={styles.bars}>
                {bars.map((bar, index) => {
                  const active = index === selectedBar;
                  const height =
                    maxBar > 0
                      ? Math.max(
                          4,
                          Math.round((bar.value / maxBar) * CHART_HEIGHT),
                        )
                      : 4;

                  return (
                    <Pressable
                      key={`${bar.label}-${index}`}
                      accessibilityRole="button"
                      accessibilityLabel={`${bar.label}, ${t('ETB')} ${fmt(
                        bar.value,
                      )}`}
                      onPress={() => setSelectedBar(index)}
                      style={styles.barColumn}
                    >
                      <View style={styles.tooltipSlot}>
                        {active ? (
                          <Text
                            style={[
                              styles.tooltip,
                              active && styles.tooltipActive,
                            ]}
                          >
                            {compact(bar.value)}
                          </Text>
                        ) : null}
                      </View>
                      <View style={styles.barArea}>
                        {bar.value > 0 || active ? (
                          <LinearGradient
                            colors={
                              active ? ['#F0D38C', GOLD] : ['#6CB4FF', BLUE]
                            }
                            start={{ x: 0, y: 1 }}
                            end={{ x: 0, y: 0 }}
                            style={[styles.bar, { height }]}
                          />
                        ) : (
                          <View style={[styles.bar, styles.barTrack]} />
                        )}
                      </View>
                      <Text
                        style={[
                          styles.barLabel,
                          active && styles.barLabelActive,
                        ]}
                      >
                        {bar.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('Spent vs earned')}</Text>
              <View style={styles.ringRow}>
                <View style={styles.ringWrap}>
                  <DoughnutChart
                    data={categories.map(item => ({
                      value: item.amount,
                      color: SPEND_CATEGORY_COLORS[item.name],
                    }))}
                    size={128}
                    strokeWidth={14}
                  />
                  <View style={styles.ringCenter}>
                    <Text style={styles.ringPct}>
                      {Math.round(insights.spentPct ?? 0)}%
                    </Text>
                    <Text style={styles.ringCaption}>{t('spent')}</Text>
                  </View>
                </View>

                <View style={styles.legend}>
                  {categories.length === 0 ? (
                    <Text style={styles.legendEmpty}>
                      {t('No spending in your categories yet.')}
                    </Text>
                  ) : (
                    categories.map(category => (
                      <View key={t(category.name)} style={styles.legendRow}>
                        <View
                          style={[
                            styles.legendDot,
                            {
                              backgroundColor:
                                SPEND_CATEGORY_COLORS[category.name],
                            },
                          ]}
                        />
                        <Text style={styles.legendName} numberOfLines={1}>
                          {t(category.name)}
                        </Text>
                        <Text style={styles.legendValue}>
                          {fmt(category.amount)}
                        </Text>
                      </View>
                    ))
                  )}
                </View>
              </View>
            </View>
          </>
        )}

        <RecentTransactions
          key={`${range}-${reportPeriod.start.getTime()}`}
          transactions={transactions.filter(item => {
            const timestamp = Date.parse(item.date);
            return (
              timestamp >= reportPeriod.start.getTime() &&
              timestamp < reportPeriod.end.getTime()
            );
          })}
          onSave={onReasonSave}
        />

        {!isEmpty && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('Top merchants')}</Text>
            {merchants.length === 0 ? (
              <Text style={styles.legendEmpty}>{t('No merchants yet.')}</Text>
            ) : (
              merchants.map((merchant, index) => {
                const color = SPEND_CATEGORY_COLORS[merchant.category];
                const isLast = index === merchants.length - 1;

                return (
                  <View
                    key={`${merchant.name}-${index}`}
                    style={[
                      styles.merchantRow,
                      !isLast && styles.merchantRowBorder,
                    ]}
                  >
                    <View
                      style={[
                        styles.merchantIcon,
                        { backgroundColor: `${color}29` },
                      ]}
                    >
                      <Text style={[styles.merchantLetter, { color }]}>
                        {merchant.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.merchantBody}>
                      <Text style={styles.merchantName} numberOfLines={1}>
                        {merchant.name}
                      </Text>
                      <Text style={styles.merchantMeta}>
                        {merchant.count} {t('TXNS ·')}{' '}
                        {Math.round(merchant.pct)}%
                      </Text>
                    </View>
                    <Text style={styles.merchantAmount}>
                      {t('ETB')} {fmt(merchant.amount)}
                    </Text>
                  </View>
                );
              })
            )}
          </View>
        )}

        <View style={styles.tabSpacer} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  periodNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  periodButton: {
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodArrow: { fontSize: 28, color: GOLD },
  periodDisabled: { opacity: 0.3 },
  periodCaption: { flex: 1, gap: 4 },
  periodLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  periodHint: { color: LABEL2, fontSize: 12, textAlign: 'center' },
  wrapper: {
    flex: 1,
    paddingTop: 8,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
  },
  subtitle: {
    color: LABEL2,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    marginTop: 6,
    textTransform: 'uppercase',
  },
  segmentWrap: {
    marginBottom: 20,
  },
  totalCard: {
    backgroundColor: GROUPED1,
    borderRadius: 20,
    borderCurve: 'continuous',
    marginBottom: 14,
    padding: 20,
  },
  totalHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardTitle: {
    color: LABEL2,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  deltaPill: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  deltaPillRed: {
    backgroundColor: 'rgba(255, 69, 58, 0.15)',
  },
  deltaPillGreen: {
    backgroundColor: 'rgba(48, 209, 88, 0.15)',
  },
  deltaText: {
    fontSize: 12,
    fontWeight: '800',
  },
  deltaTextRed: {
    color: RED,
  },
  deltaTextGreen: {
    color: GREEN,
  },
  totalValueRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    marginTop: 10,
  },
  totalCurrency: {
    color: LABEL2,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
    marginRight: 8,
  },
  totalValue: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.8,
  },
  totalCaption: {
    color: LABEL3,
    fontSize: 11,
    marginTop: 6,
  },
  card: {
    backgroundColor: GROUPED1,
    borderRadius: 20,
    borderCurve: 'continuous',
    gap: 14,
    marginBottom: 14,
    padding: 20,
  },
  bars: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 8,
  },
  barColumn: {
    flex: 1,
  },
  tooltipSlot: {
    alignItems: 'center',
    height: 22,
    justifyContent: 'center',
  },
  tooltip: {
    backgroundColor: '#3A3A3C',
    borderRadius: 8,
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    overflow: 'hidden',
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  tooltipActive: {
    backgroundColor: 'rgba(216, 180, 92, 0.22)',
    color: '#F0D38C',
  },
  bar: {
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    width: '62%',
  },
  barArea: {
    alignItems: 'center',
    height: CHART_HEIGHT,
    justifyContent: 'flex-end',
  },
  barTrack: {
    backgroundColor: 'rgba(235, 235, 245, 0.08)',
    height: 4,
  },
  barLabel: {
    color: LABEL3,
    fontSize: 9,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  barLabelActive: {
    color: GOLD,
  },
  ringRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 20,
  },
  ringWrap: {
    alignItems: 'center',
    height: 128,
    justifyContent: 'center',
    width: 128,
  },
  ringCenter: {
    alignItems: 'center',
    position: 'absolute',
  },
  ringPct: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
  },
  ringCaption: {
    color: LABEL2,
    fontSize: 9,
    fontWeight: '600',
    marginTop: 1,
  },
  legend: {
    flex: 1,
    gap: 9,
  },
  legendRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  legendDot: {
    borderRadius: 999,
    height: 9,
    width: 9,
  },
  legendName: {
    color: '#FFFFFF',
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  legendValue: {
    color: LABEL2,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  legendEmpty: {
    color: LABEL3,
    fontSize: 12,
    lineHeight: 18,
  },
  merchantRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 11,
  },
  merchantRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: HAIRLINE,
  },
  merchantIcon: {
    alignItems: 'center',
    borderRadius: 11,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  merchantLetter: {
    fontSize: 15,
    fontWeight: '800',
  },
  merchantBody: {
    flex: 1,
  },
  merchantName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  merchantMeta: {
    color: LABEL3,
    fontSize: 10,
    letterSpacing: 0.6,
    marginTop: 2,
  },
  merchantAmount: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  emptyCard: {
    backgroundColor: GROUPED1,
    borderRadius: 20,
    borderCurve: 'continuous',
    gap: 10,
    padding: 24,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  emptyText: {
    color: LABEL2,
    fontSize: 13,
    lineHeight: 20,
  },
  tabSpacer: {
    height: 100,
  },
});
