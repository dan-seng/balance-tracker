import { getLocale } from '../i18n';
import { t } from '../i18n';
import { StyleSheet, View } from 'react-native';
import { AppText as Text } from './AppText';

import { Transaction } from '../models';

type TransactionCardProps = {
  transaction: Transaction;
};

export function TransactionCard({ transaction }: TransactionCardProps) {
  const isCredit = transaction.type === 'credit';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.icon}>
          <Text
            style={[
              styles.iconText,
              isCredit ? styles.creditIcon : styles.debitIcon,
            ]}
          >
            {isCredit ? '↑' : '↓'}
          </Text>
        </View>
        <View style={styles.bankInfo}>
          <Text style={styles.bank}>{transaction.bankName}</Text>
          <Text style={styles.date}>
            {new Date(transaction.date).toLocaleDateString(getLocale())}
          </Text>
        </View>
        <Text style={[styles.amount, isCredit ? styles.credit : styles.debit]}>
          {isCredit ? '+' : '-'}
          {transaction.amount.toLocaleString(getLocale())}
        </Text>
      </View>
      <View style={styles.footer}>
        <Text style={styles.balance}>
          {t('Balance: ETB')}{' '}
          {transaction.balanceAfter?.toLocaleString(getLocale()) ?? t('N/A')}
        </Text>
        <Text style={styles.sms} numberOfLines={2}>
          {transaction.rawSms}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#122019',
    borderColor: '#24352F',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  icon: {
    backgroundColor: '#1A2A23',
    borderRadius: 999,
    height: 36,
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 18,
  },
  creditIcon: {
    color: '#6BDB93',
  },
  debitIcon: {
    color: '#FFB38A',
  },
  bankInfo: {
    flex: 1,
    marginLeft: 12,
  },
  bank: {
    color: '#F5F7F1',
    fontSize: 14,
    fontWeight: '700',
  },
  date: {
    color: '#93A89D',
    fontSize: 11,
    marginTop: 2,
  },
  amount: {
    fontSize: 16,
    fontWeight: '800',
  },
  credit: {
    color: '#6BDB93',
  },
  debit: {
    color: '#FFB38A',
  },
  footer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#24352F',
  },
  balance: {
    color: '#93A89D',
    fontSize: 12,
    marginBottom: 8,
  },
  sms: {
    color: '#88A094',
    fontSize: 11,
    lineHeight: 16,
  },
});
