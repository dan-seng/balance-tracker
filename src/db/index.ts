import { Transaction, Account } from '../models';
import {
  initDatabase,
  saveAccount,
  getAccounts,
  getAccountById,
  updateAccountBalance,
  saveTransaction,
  getTransactions,
  getTransactionsForAccount,
  transactionExists,
  deleteTransaction,
  deleteAllTransactions,
  deleteAllAccounts,
  setUserName,
  getUserName,
} from './sqliteDatabase';

// Initialize database on module load
let dbInitialized = false;

export async function ensureDatabaseInitialized() {
  if (!dbInitialized) {
    await initDatabase();
    dbInitialized = true;
  }
}

export { initDatabase };

export async function saveAccountToDb(account: Account) {
  await ensureDatabaseInitialized();
  return saveAccount(account);
}

export async function getAccountsFromDb(): Promise<Account[]> {
  await ensureDatabaseInitialized();
  return getAccounts();
}

export async function getAccountByIdFromDb(id: string): Promise<Account | null> {
  await ensureDatabaseInitialized();
  return getAccountById(id);
}

export async function updateAccountBalanceInDb(accountId: string, newBalance: number) {
  await ensureDatabaseInitialized();
  return updateAccountBalance(accountId, newBalance);
}

export async function saveTransactionToDb(transaction: Transaction) {
  await ensureDatabaseInitialized();
  return saveTransaction(transaction);
}

export async function getTransactionsFromDb(): Promise<Transaction[]> {
  await ensureDatabaseInitialized();
  return getTransactions();
}

export async function getTransactionsForAccountFromDb(accountId: string): Promise<Transaction[]> {
  await ensureDatabaseInitialized();
  return getTransactionsForAccount(accountId);
}

export async function transactionExistsInDb(hash: string): Promise<boolean> {
  await ensureDatabaseInitialized();
  return transactionExists(hash);
}

export async function deleteTransactionFromDb(id: string) {
  await ensureDatabaseInitialized();
  return deleteTransaction(id);
}

export async function clearAllTransactionsFromDb() {
  await ensureDatabaseInitialized();
  return deleteAllTransactions();
}

export async function clearAllAccountsFromDb() {
  await ensureDatabaseInitialized();
  return deleteAllAccounts();
}

export async function setUserNameInDb(name: string) {
  await ensureDatabaseInitialized();
  return setUserName(name);
}

export async function getUserNameFromDb(): Promise<string | null> {
  await ensureDatabaseInitialized();
  return getUserName();
}
