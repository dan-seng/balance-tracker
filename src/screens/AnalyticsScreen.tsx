import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText as Text } from '../components/AppText';;

import { Screen } from '../components/Screen';
import { DoughnutChart } from '../components/DoughnutChart';
import { Transaction } from '../models';
import { categorizeTransaction, Category } from '../utils/categoryUtils';

const CATEGORY_COLORS: Record<Category, string> = {
  Transfer: '#FFB38A', // Orange
  Payment: '#F4D5C9',  // Rose
  Withdrawal: '#D7FF74', // Lime
  Deposit: '#6BDB93',  // Mint
  Received: '#FFFFFF', // Very soft white
  Other: '#8A9A92'     // Muted gray
};

type AnalyticsScreenProps = {
  transactions: Transaction[];
};

export function AnalyticsScreen({ transactions }: AnalyticsScreenProps) {
  const { totalSpend, totalIncome, spendData, incomeData } = useMemo(() => {
    let spend = 0;
    let income = 0;
    const spendCat: Partial<Record<Category, number>> = {};
    const incomeCat: Partial<Record<Category, number>> = {};

    transactions.forEach(t => {
      const cat = categorizeTransaction(t);
      if (t.type === 'debit') {
        spend += t.amount;
        spendCat[cat] = (spendCat[cat] || 0) + t.amount;
      } else {
        income += t.amount;
        incomeCat[cat] = (incomeCat[cat] || 0) + t.amount;
      }
    });

    const formatData = (catData: Partial<Record<Category, number>>, total: number) => {
      return Object.entries(catData)
        .sort((a, b) => b[1] - a[1])
        .map(([name, amount]) => ({
          name,
          amount,
          percentage: total > 0 ? (amount / total) * 100 : 0
        }));
    };

    return {
      totalSpend: spend,
      totalIncome: income,
      spendData: formatData(spendCat, spend),
      incomeData: formatData(incomeCat, income),
    };
  }, [transactions]);

  const renderBar = (label: string, amount: number, percentage: number, color: string) => (
    <View key={label} style={styles.barContainer}>
      <View style={styles.barHeader}>
        <Text style={styles.barLabel}>{label}</Text>
        <Text style={styles.barAmount}>{Math.round(amount).toLocaleString()} ETB</Text>
      </View>
      <View style={styles.progressBackground}>
        <View style={[styles.progressFill, { width: `${percentage}%`, backgroundColor: color }]} />
      </View>
    </View>
  );

  return (
    <Screen scrollable>
      <View style={styles.wrapper}>
        <Text style={styles.title}>Analytics</Text>
        
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Spent</Text>
            <Text style={styles.summaryValue}>{Math.round(totalSpend).toLocaleString()}</Text>
          </View>
          <View style={[styles.summaryCard, styles.incomeCard]}>
            <Text style={styles.summaryLabel}>Total Income</Text>
            <Text style={[styles.summaryValue, styles.incomeValue]}>{Math.round(totalIncome).toLocaleString()}</Text>
          </View>
        </View>
        
        {spendData.length > 0 && (
          <View style={styles.chartContainer}>
            <DoughnutChart 
              data={spendData.map(d => ({
                value: d.amount,
                color: CATEGORY_COLORS[d.name as Category] || '#FFFFFF'
              }))} 
              size={180} 
              strokeWidth={20} 
            />
            {/* Center Summary Label */}
            <View style={styles.chartCenterOverlay} pointerEvents="none">
              <Text style={styles.chartCenterLabel}>Total spend</Text>
            </View>
          </View>
        )}

        <Text style={styles.sectionTitle}>Spending Breakdown</Text>
        <View style={styles.card}>
          {spendData.length === 0 ? (
            <Text style={styles.emptyText}>No spending recorded yet.</Text>
          ) : (
            spendData.map(d => renderBar(d.name, d.amount, d.percentage, CATEGORY_COLORS[d.name as Category] || '#FFB38A'))
          )}
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 32 }]}>Income Breakdown</Text>
        <View style={styles.card}>
          {incomeData.length === 0 ? (
            <Text style={styles.emptyText}>No income recorded yet.</Text>
          ) : (
            incomeData.map(d => renderBar(d.name, d.amount, d.percentage, CATEGORY_COLORS[d.name as Category] || '#6BDB93'))
          )}
        </View>
        
        {/* Spacer so content doesn't heavily underlap the floating bottom nav */}
        <View style={{height: 100}} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingTop: 32,
    flex: 1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 24,
    letterSpacing: -1,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  summaryCard: {
    backgroundColor: '#1d674266',
    borderRadius: 16,
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  incomeCard: {
    backgroundColor: '#1d674266',
  },
  summaryLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  summaryValue: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  incomeValue: {
    color: '#FFFFFF',
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    marginTop: 10,
    width: '100%',
    position: 'relative',
  },
  chartCenterOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartCenterLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: '#1A2A23',
    borderRadius: 24,
    padding: 24,
    gap: 24,
  },
  barContainer: {
    width: '100%',
  },
  barHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  barLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  barAmount: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  progressBackground: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  emptyText: {
    color: '#FFFFFF',
    fontStyle: 'italic',
  }
});
