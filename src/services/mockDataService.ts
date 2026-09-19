import { Account, Transaction } from '../models';
import { getSampleSmsMessages } from './smsService';

const accounts: Account[] = [
  {
    id: 'cbe-main',
    bankId: 'cbe',
    bankName: 'CBEiopia',
    accountNumber: '•••• 1034',
    currentBalance: 16300.25,
    currency: 'ETB',
    lastUpdated: '2026-04-14T12:45:00.000Z',
    source: 'sms',
  },
  {
    id: 'dashen-main',
    bankId: 'dashen',
    bankName: 'Dashen Bank',
    accountNumber: '•••• 8842',
    currentBalance: 23550,
    currency: 'ETB',
    lastUpdated: '2026-04-13T16:40:00.000Z',
    source: 'sms',
  },
  {
    id: 'awash-main',
    bankId: 'awash',
    bankName: 'Awash Bank',
    accountNumber: '•••• 2218',
    currentBalance: 9250,
    currency: 'ETB',
    lastUpdated: '2026-04-12T18:15:00.000Z',
    source: 'sms',
  },
];

const transactions: Transaction[] = [
  {
    id: 'txn-1',
    accountId: 'cbe-main',
    bankId: 'cbe',
    bankName: 'CBEiopia',
    type: 'credit',
    amount: 2500,
    balanceAfter: 15420.25,
    date: '2026-04-14T08:30:00.000Z',
    rawSms:
      'Your account has been credited with ETB 2,500.00. Your balance is ETB 15,420.25.',
    hash: 'sms-1',
    currency: 'ETB',
    sender: 'CBE',
  },
  {
    id: 'txn-2',
    accountId: 'cbe-main',
    bankId: 'cbe',
    bankName: 'CBEiopia',
    type: 'debit',
    amount: 320,
    balanceAfter: 15100.25,
    date: '2026-04-14T10:10:00.000Z',
    rawSms:
      'Your account has been debited ETB 320.00 for merchant payment. Your balance is ETB 15,100.25.',
    hash: 'sms-2',
    currency: 'ETB',
    sender: 'CBE',
  },
  {
    id: 'txn-3',
    accountId: 'cbe-main',
    bankId: 'cbe',
    bankName: 'CBEiopia',
    type: 'credit',
    amount: 1200,
    balanceAfter: 16300.25,
    date: '2026-04-14T12:45:00.000Z',
    rawSms:
      'Your account has been credited with ETB 1,200.00. Your balance is ETB 16,300.25.',
    hash: 'sms-3',
    currency: 'ETB',
    sender: 'CBE',
  },
  {
    id: 'txn-4',
    accountId: 'dashen-main',
    bankId: 'dashen',
    bankName: 'Dashen Bank',
    type: 'credit',
    amount: 8400,
    balanceAfter: 24800,
    date: '2026-04-13T07:50:00.000Z',
    rawSms:
      'Dashen Bank alert: Salary credited ETB 8,400.00. Available balance ETB 24,800.00.',
    hash: 'sms-4',
    currency: 'ETB',
    sender: 'Dashen',
  },
  {
    id: 'txn-5',
    accountId: 'dashen-main',
    bankId: 'dashen',
    bankName: 'Dashen Bank',
    type: 'debit',
    amount: 1250,
    balanceAfter: 23550,
    date: '2026-04-13T16:40:00.000Z',
    rawSms:
      'Dashen Bank alert: Purchase debited ETB 1,250.00. Available balance ETB 23,550.00.',
    hash: 'sms-5',
    currency: 'ETB',
    sender: 'Dashen',
  },
  {
    id: 'txn-6',
    accountId: 'awash-main',
    bankId: 'awash',
    bankName: 'Awash Bank',
    type: 'credit',
    amount: 3600,
    balanceAfter: 10150,
    date: '2026-04-12T09:05:00.000Z',
    rawSms:
      'Awash notification: Account credited ETB 3,600.00. Current balance ETB 10,150.00.',
    hash: 'sms-6',
    currency: 'ETB',
    sender: 'Awash',
  },
  {
    id: 'txn-7',
    accountId: 'awash-main',
    bankId: 'awash',
    bankName: 'Awash Bank',
    type: 'debit',
    amount: 900,
    balanceAfter: 9250,
    date: '2026-04-12T18:15:00.000Z',
    rawSms:
      'Awash notification: Transfer debited ETB 900.00. Current balance ETB 9,250.00.',
    hash: 'sms-7',
    currency: 'ETB',
    sender: 'Awash',
  },
];

export function getAccounts() {
  return accounts;
}

export function getTransactions() {
  return transactions;
}

export function getTransactionsForAccount(accountId: string) {
  return transactions.filter(item => item.accountId === accountId);
}

export function getPortfolioBalance() {
  return accounts.reduce((sum, account) => sum + account.currentBalance, 0);
}

export function getParsedSmsCount() {
  return getSampleSmsMessages().length;
}
