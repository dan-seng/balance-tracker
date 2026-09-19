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
  setBalanceHidden,
  getBalanceHidden,
  setUserTitle,
  getUserTitle,
  saveCustomBank,
  getCustomBanks,
  deleteCustomBank,
  setAppLocked,
  getAppLocked,
  setAutoLockTimeout,
  getAutoLockTimeout,
  renameAccountInDb,
  mergeAccountsInDb,
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

export async function setBalanceHiddenInDb(isHidden: boolean) {
  await ensureDatabaseInitialized();
  return setBalanceHidden(isHidden);
}

export async function getBalanceHiddenFromDb(): Promise<boolean> {
  await ensureDatabaseInitialized();
  return getBalanceHidden();
}

export async function setUserTitleInDb(title: string) {
  await ensureDatabaseInitialized();
  return setUserTitle(title);
}

export async function getUserTitleFromDb(): Promise<string | null> {
  await ensureDatabaseInitialized();
  return getUserTitle();
}

export async function saveCustomBankInDb(bankId: string, bankName: string, senderId: string, logoBase64: string | null) {
  await ensureDatabaseInitialized();
  return saveCustomBank(bankId, bankName, senderId, logoBase64);
}

export async function getCustomBanksFromDb(): Promise<Array<{ bankId: string; bankName: string; senderId: string; logoBase64: string | null }>> {
  await ensureDatabaseInitialized();
  return getCustomBanks();
}

export async function deleteCustomBankFromDb(bankId: string) {
  await ensureDatabaseInitialized();
  return deleteCustomBank(bankId);
}

export async function setAppLockedInDb(isLocked: boolean) {
  await ensureDatabaseInitialized();
  return setAppLocked(isLocked);
}

export async function getAppLockedFromDb(): Promise<boolean> {
  await ensureDatabaseInitialized();
  return getAppLocked();
}

export async function setAutoLockTimeoutInDb(timeout: number) {
  await ensureDatabaseInitialized();
  return setAutoLockTimeout(timeout);
}

export async function getAutoLockTimeoutFromDb(): Promise<number> {
  await ensureDatabaseInitialized();
  return getAutoLockTimeout();
}

export async function renameAccountToDb(accountId: string, newBankName: string): Promise<void> {
  await ensureDatabaseInitialized();
  return renameAccountInDb(accountId, newBankName);
}

export async function mergeAccountsToDb(sourceId: string, targetId: string): Promise<void> {
  await ensureDatabaseInitialized();
  return mergeAccountsInDb(sourceId, targetId);
}
