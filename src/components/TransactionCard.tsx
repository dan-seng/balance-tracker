import { StyleSheet, Text, View } from 'react-native';

import { Transaction } from '../models';

type TransactionCardProps = {
  transaction: Transaction;
};

export function TransactionCard({ transaction }: TransactionCardProps) {
  const isCredit = transaction.type === 'credit';

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View>
          <Text style={styles.bank}>{transaction.bankName}</Text>
          <Text style={styles.date}>
            {new Date(transaction.date).toLocaleDateString()}
          </Text>
        </View>
        <Text style={[styles.amount, isCredit ? styles.credit : styles.debit]}>
          {isCredit ? '+' : '-'}ETB {transaction.amount.toLocaleString()}
        </Text>
      </View>
      <Text style={styles.balance}>
        Balance after: ETB {transaction.balanceAfter?.toLocaleString() ?? 'N/A'}
      </Text>
      <Text style={styles.sms} numberOfLines={2}>
        {transaction.rawSms}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#162720',
    borderColor: '#274338',
    borderRadius: 20,
    borderWidth: 1,
    gap: 10,
    padding: 20,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bank: {
    color: '#F5F7F1',
    fontSize: 15,
    fontWeight: '700',
  },
  date: {
    color: '#93A89D',
    fontSize: 12,
    marginTop: 4,
  },
  amount: {
    fontSize: 17,
    fontWeight: '800',
  },
  credit: {
    color: '#D7FF74',
  },
  debit: {
    color: '#FFB38A',
  },
  balance: {
    color: '#C5D0CA',
    fontSize: 13,
  },
  sms: {
    color: '#88A094',
    fontSize: 12,
    lineHeight: 18,
  },
});
