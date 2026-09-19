import SQLite from 'react-native-sqlite-storage';
import { Account, Transaction } from '../models';

const DB_NAME = 'HisabApp.db';

// Enable promises for SQLite
SQLite.enablePromise(true);

let db: SQLite.SQLiteDatabase | null = null;

export async function initDatabase(): Promise<void> {
  try {
    db = await SQLite.openDatabase({
      name: DB_NAME,
      location: 'default',
    });

    await createTables();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

async function createTables(): Promise<void> {
  if (!db) throw new Error('Database not initialized');

  // Create accounts table
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      bank_id TEXT NOT NULL,
      bank_name TEXT NOT NULL,
      account_number TEXT NOT NULL,
      current_balance REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'ETB',
      last_updated TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT 'sms'
    );
  `);

  // Create transactions table
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL,
      bank_id TEXT NOT NULL,
      bank_name TEXT NOT NULL,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      balance_after REAL,
      date TEXT NOT NULL,
      raw_sms TEXT NOT NULL,
      hash TEXT NOT NULL,
      currency TEXT NOT NULL DEFAULT 'ETB',
      sender TEXT NOT NULL,
      FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
    );
  `);

  // Create user_settings table for preferences
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS user_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Create indexes for better query performance
  await db.executeSql(`CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);`);
  await db.executeSql(`CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);`);
  await db.executeSql(`CREATE INDEX IF NOT EXISTS idx_transactions_hash ON transactions(hash);`);

  // Migration: add sub_id (SIM/subscription id) to accounts for existing installs
  const [cols] = await db.executeSql('PRAGMA table_info(accounts);');
  let hasSubId = false;
  for (let i = 0; i < cols.rows.length; i++) {
    if (cols.rows.item(i).name === 'sub_id') {
      hasSubId = true;
      break;
    }
  }
  if (!hasSubId) {
    await db.executeSql('ALTER TABLE accounts ADD COLUMN sub_id INTEGER DEFAULT NULL;');
  }
}

export async function saveAccount(account: Account): Promise<void> {
  if (!db) throw new Error('Database not initialized');

  await db.executeSql(`
    INSERT OR REPLACE INTO accounts (id, bank_id, bank_name, account_number, current_balance, currency, last_updated, source, sub_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    account.id,
    account.bankId,
    account.bankName,
    account.accountNumber,
    account.currentBalance,
    account.currency,
    account.lastUpdated,
    account.source,
    account.subId != null ? account.subId : null,
  ]);
}

export async function getAccounts(): Promise<Account[]> {
  if (!db) throw new Error('Database not initialized');

  const [results] = await db.executeSql('SELECT * FROM accounts ORDER BY last_updated DESC;');

  const accounts: Account[] = [];
  for (let i = 0; i < results.rows.length; i++) {
    const row = results.rows.item(i);
    accounts.push({
      id: row.id,
      bankId: row.bank_id,
      bankName: row.bank_name,
      accountNumber: row.account_number,
      currentBalance: row.current_balance,
      currency: row.currency,
      lastUpdated: row.last_updated,
      source: row.source,
      subId: row.sub_id != null ? Number(row.sub_id) : null,
    });
  }

  return accounts;
}

export async function getAccountById(id: string): Promise<Account | null> {
  if (!db) throw new Error('Database not initialized');

  const [results] = await db.executeSql('SELECT * FROM accounts WHERE id = ?;', [id]);

  if (results.rows.length === 0) {
    return null;
  }

  const row = results.rows.item(0);
  return {
    id: row.id,
    bankId: row.bank_id,
    bankName: row.bank_name,
    accountNumber: row.account_number,
    currentBalance: row.current_balance,
    currency: row.currency,
    lastUpdated: row.last_updated,
    source: row.source,
    subId: row.sub_id != null ? Number(row.sub_id) : null,
  };
}

export async function updateAccountBalance(accountId: string, newBalance: number): Promise<void> {
  if (!db) throw new Error('Database not initialized');

  await db.executeSql(`
    UPDATE accounts
    SET current_balance = ?, last_updated = ?
    WHERE id = ?
  `, [newBalance, new Date().toISOString(), accountId]);
}

function accountDigits(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/[^\d]/g, '');
  return digits.length >= 4 ? digits : null;
}

export async function renameAccountInDb(accountId: string, newBankName: string): Promise<void> {
  if (!db) throw new Error('Database not initialized');
  await db.executeSql(`UPDATE accounts SET bank_name = ? WHERE id = ?;`, [newBankName.trim(), accountId]);
}

export async function mergeAccountsInDb(sourceId: string, targetId: string): Promise<void> {
  if (!db) throw new Error('Database not initialized');
  if (sourceId === targetId) throw new Error('Cannot merge an account into itself');

  const [sourceRows] = await db.executeSql('SELECT * FROM accounts WHERE id = ?;', [sourceId]);
  const [targetRows] = await db.executeSql('SELECT * FROM accounts WHERE id = ?;', [targetId]);
  if (sourceRows.rows.length === 0 || targetRows.rows.length === 0) {
    throw new Error('One of the accounts no longer exists');
  }

  const source = sourceRows.rows.item(0);
  const target = targetRows.rows.item(0);

  const sourceDigits = accountDigits(source.account_number);
  const targetDigits = accountDigits(target.account_number);

  // Prefer the richer identity: longer masked account number, a real SIM id,
  // a non-placeholder bank name, and a non-null balance.
  let bankName = target.bank_name;
  let accountNumber = target.account_number;
  let subId = target.sub_id != null ? Number(target.sub_id) : null;
  let balance = target.current_balance != null ? Number(target.current_balance) : null;
  let lastUpdated = target.last_updated;

  const richerDigits =
    sourceDigits && (!targetDigits || sourceDigits.length > targetDigits.length);
  if (richerDigits) accountNumber = source.account_number;
  if (subId == null && source.sub_id != null) subId = Number(source.sub_id);
  const placeholder = (n: string) => !n || /^(placeholder|unknown)$/i.test(n.trim());
  if (placeholder(bankName) && !placeholder(source.bank_name)) {
    bankName = source.bank_name;
  }
  if (balance == null && source.current_balance != null) {
    balance = Number(source.current_balance);
    lastUpdated = source.last_updated;
  }

  await db.executeSql(
    'UPDATE accounts SET bank_name = ?, account_number = ?, current_balance = ?, last_updated = ?, sub_id = ? WHERE id = ?;',
    [bankName, accountNumber, balance, lastUpdated, subId, targetId]
  );

  // Re-point every transaction from the source onto the merged account.
  await db.executeSql(
    'UPDATE transactions SET account_id = ? WHERE account_id = ?;', [targetId, sourceId]
  );

  // The source account is now fully absorbed.
  await db.executeSql('DELETE FROM accounts WHERE id = ?;', [sourceId]);
}


export async function saveTransaction(transaction: Transaction): Promise<void> {
  if (!db) throw new Error('Database not initialized');

  await db.executeSql(`
    INSERT OR REPLACE INTO transactions (id, account_id, bank_id, bank_name, type, amount, balance_after, date, raw_sms, hash, currency, sender)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    transaction.id,
    transaction.accountId,
    transaction.bankId,
    transaction.bankName,
    transaction.type,
    transaction.amount,
    transaction.balanceAfter,
    transaction.date,
    transaction.rawSms,
    transaction.hash,
    transaction.currency,
    transaction.sender,
  ]);
}

export async function getTransactions(): Promise<Transaction[]> {
  if (!db) throw new Error('Database not initialized');

  const [results] = await db.executeSql('SELECT * FROM transactions ORDER BY date DESC;');

  const transactions: Transaction[] = [];
  for (let i = 0; i < results.rows.length; i++) {
    const row = results.rows.item(i);
    transactions.push({
      id: row.id,
      accountId: row.account_id,
      bankId: row.bank_id,
      bankName: row.bank_name,
      type: row.type,
      amount: row.amount,
      balanceAfter: row.balance_after,
      date: row.date,
      rawSms: row.raw_sms,
      hash: row.hash,
      currency: row.currency,
      sender: row.sender,
    });
  }

  return transactions;
}

export async function getTransactionsForAccount(accountId: string): Promise<Transaction[]> {
  if (!db) throw new Error('Database not initialized');

  const [results] = await db.executeSql('SELECT * FROM transactions WHERE account_id = ? ORDER BY date DESC;', [accountId]);

  const transactions: Transaction[] = [];
  for (let i = 0; i < results.rows.length; i++) {
    const row = results.rows.item(i);
    transactions.push({
      id: row.id,
      accountId: row.account_id,
      bankId: row.bank_id,
      bankName: row.bank_name,
      type: row.type,
      amount: row.amount,
      balanceAfter: row.balance_after,
      date: row.date,
      rawSms: row.raw_sms,
      hash: row.hash,
      currency: row.currency,
      sender: row.sender,
    });
  }

  return transactions;
}

export async function transactionExists(hash: string): Promise<boolean> {
  if (!db) throw new Error('Database not initialized');

  const [results] = await db.executeSql('SELECT COUNT(*) as count FROM transactions WHERE hash = ?;', [hash]);
  const row = results.rows.item(0);

  return row.count > 0;
}

export async function deleteTransaction(id: string): Promise<void> {
  if (!db) throw new Error('Database not initialized');

  await db.executeSql('DELETE FROM transactions WHERE id = ?;', [id]);
}

export async function deleteAllTransactions(): Promise<void> {
  if (!db) throw new Error('Database not initialized');

  await db.executeSql('DELETE FROM transactions;');
}

export async function deleteAllAccounts(): Promise<void> {
  if (!db) throw new Error('Database not initialized');

  await db.executeSql('DELETE FROM accounts;');
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.close();
    db = null;
  }
}

export async function setUserName(name: string): Promise<void> {
  if (!db) throw new Error('Database not initialized');
  await db.executeSql(
    `INSERT OR REPLACE INTO user_settings (key, value) VALUES ('username', ?)`,
    [name]
  );
}

export async function getUserName(): Promise<string | null> {
  if (!db) throw new Error('Database not initialized');
  const [results] = await db.executeSql(
    `SELECT value FROM user_settings WHERE key = 'username';`
  );
  if (results.rows.length === 0) {
    return null;
  }
  return results.rows.item(0).value;
}

export async function setBalanceHidden(isHidden: boolean): Promise<void> {
  if (!db) throw new Error('Database not initialized');
  await db.executeSql(
    `INSERT OR REPLACE INTO user_settings (key, value) VALUES ('balance_hidden', ?)`,
    [isHidden ? '1' : '0']
  );
}

export async function getBalanceHidden(): Promise<boolean> {
  if (!db) throw new Error('Database not initialized');
  const [results] = await db.executeSql(
    `SELECT value FROM user_settings WHERE key = 'balance_hidden';`
  );
  if (results.rows.length === 0) {
    return false;
  }
  return results.rows.item(0).value === '1';
}

export async function setAppLocked(isLocked: boolean): Promise<void> {
  if (!db) throw new Error('Database not initialized');
  await db.executeSql(
    `INSERT OR REPLACE INTO user_settings (key, value) VALUES ('app_locked', ?)` ,
    [isLocked ? '1' : '0']
  );
}

export async function getAppLocked(): Promise<boolean> {
  if (!db) throw new Error('Database not initialized');
  const [results] = await db.executeSql(
    `SELECT value FROM user_settings WHERE key = 'app_locked';`
  );
  if (results.rows.length === 0) {
    return false;
  }
  return results.rows.item(0).value === '1';
}

export async function setAutoLockTimeout(timeout: number): Promise<void> {
  if (!db) throw new Error('Database not initialized');
  await db.executeSql(
    `INSERT OR REPLACE INTO user_settings (key, value) VALUES ('auto_lock_timeout', ?)` ,
    [timeout.toString()]
  );
}

export async function getAutoLockTimeout(): Promise<number> {
  if (!db) throw new Error('Database not initialized');
  const [results] = await db.executeSql(
    `SELECT value FROM user_settings WHERE key = 'auto_lock_timeout';`
  );
  if (results.rows.length === 0) {
    return 0; // Default: 0 (immediately)
  }
  return parseInt(results.rows.item(0).value, 10);
}

export async function setUserTitle(title: string): Promise<void> {
  if (!db) throw new Error('Database not initialized');
  await db.executeSql(
    `INSERT OR REPLACE INTO user_settings (key, value) VALUES ('user_title', ?)`,
    [title]
  );
}

export async function getUserTitle(): Promise<string | null> {
  if (!db) throw new Error('Database not initialized');
  const [results] = await db.executeSql(
    `SELECT value FROM user_settings WHERE key = 'user_title';`
  );
  if (results.rows.length === 0) {
    return null;
  }
  return results.rows.item(0).value;
}

export async function saveCustomBank(bankId: string, bankName: string, senderId: string, logoBase64: string | null): Promise<void> {
  if (!db) throw new Error('Database not initialized');
  await db.executeSql(
    `INSERT OR REPLACE INTO user_settings (key, value) VALUES (?, ?)`,
    [`custom_bank_${bankId}`, JSON.stringify({ bankName, senderId, logoBase64 })]
  );
}

export async function getCustomBanks(): Promise<Array<{ bankId: string; bankName: string; senderId: string; logoBase64: string | null }>> {
  if (!db) throw new Error('Database not initialized');
  const [results] = await db.executeSql(
    `SELECT key, value FROM user_settings WHERE key LIKE 'custom_bank_%';`
  );
  const banks: Array<{ bankId: string; bankName: string; senderId: string; logoBase64: string | null }> = [];
  for (let i = 0; i < results.rows.length; i++) {
    const row = results.rows.item(i);
    const bankId = row.key.replace('custom_bank_', '');
    try {
      const data = JSON.parse(row.value);
      banks.push({ bankId, bankName: data.bankName, senderId: data.senderId, logoBase64: data.logoBase64 || null });
    } catch (e) {
      console.error('Failed to parse custom bank data:', e);
    }
  }
  return banks;
}

export async function deleteCustomBank(bankId: string): Promise<void> {
  if (!db) throw new Error('Database not initialized');
  await db.executeSql(
    `DELETE FROM user_settings WHERE key = ?;`,
    [`custom_bank_${bankId}`]
  );
}
