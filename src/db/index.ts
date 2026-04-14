import { Transaction } from '../models';

const inMemoryTransactions: Transaction[] = [];

export function saveTransaction(transaction: Transaction) {
  inMemoryTransactions.push(transaction);
}

export function getTransactions() {
  return inMemoryTransactions;
}
