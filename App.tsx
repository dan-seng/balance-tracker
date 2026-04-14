import { useCallback, useEffect, useRef, useState } from 'react';
import { StatusBar, Alert, NativeModules } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

import { Account, Transaction } from './src/models';
import { BankDetailScreen } from './src/screens/BankDetailScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { SyncingScreen } from './src/screens/SyncingScreen';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { clearAllAccountsFromDb, clearAllTransactionsFromDb, getAccountsFromDb, getTransactionsFromDb, initDatabase, saveAccountToDb, saveTransactionToDb, transactionExistsInDb, updateAccountBalanceInDb } from './src/db';
import { nativeSmsService } from './src/services/nativeSmsService';
import { parseSms } from './src/services/parserService';
import { calculateBalance, generateSmsHash } from './src/utils/balanceUtils';

function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dbReady, setDbReady] = useState(false);
  const [smsPermissionsGranted, setSmsPermissionsGranted] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const accountsRef = useRef<Account[]>([]);

  useEffect(() => {
    accountsRef.current = accounts;
  }, [accounts]);

  const initializeDatabase = async () => {
    try {
      await initDatabase();
      setDbReady(true);
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  };

  const loadTransactions = useCallback(async () => {
    try {
      const loadedTransactions = await getTransactionsFromDb();
      setTransactions(loadedTransactions);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  }, []);

  const getTransactionsForAccount = (accountId: string): Transaction[] => {
    return transactions
      .filter(t => t.accountId === accountId)
      .sort(
        (left, right) =>
          new Date(right.date).getTime() - new Date(left.date).getTime(),
      )
      .slice(0, 15);
  };

  const requestSmsPermissions = useCallback(async () => {
    try {
      const receiveStatus = await check(PERMISSIONS.ANDROID.RECEIVE_SMS);
      const readStatus = await check(PERMISSIONS.ANDROID.READ_SMS);

      const finalReceiveStatus =
        receiveStatus === RESULTS.DENIED
          ? await request(PERMISSIONS.ANDROID.RECEIVE_SMS)
          : receiveStatus;
      const finalReadStatus =
        readStatus === RESULTS.DENIED
          ? await request(PERMISSIONS.ANDROID.READ_SMS)
          : readStatus;

      const granted =
        finalReceiveStatus === RESULTS.GRANTED &&
        finalReadStatus === RESULTS.GRANTED;

      setSmsPermissionsGranted(granted);

      if (!granted) {
        Alert.alert(
          'Permission Required',
          'READ_SMS and RECEIVE_SMS are needed to import bank messages.',
        );
      }
    } catch (error) {
      console.error('Permission request error:', error);
    }
  }, []);

  const ingestSmsMessages = useCallback(async (
    smsMessages: Array<{ sender: string; message: string; timestamp: number }>,
  ) => {
    const currentAccounts = await getAccountsFromDb();
    const orderedMessages = [...smsMessages].sort(
      (left, right) => left.timestamp - right.timestamp,
    );

    for (const sms of orderedMessages) {
      const { sender, message, timestamp } = sms;
      const parsed = parseSms(message, sender);
      if (!parsed || parsed.bankId === 'unknown') {
        continue;
      }

      const hash = generateSmsHash(message, sender, timestamp);
      const exists = await transactionExistsInDb(hash);
      if (exists) {
        continue;
      }

      let account = currentAccounts.find(a => a.bankId === parsed.bankId);

      if (!account) {
        const newAccount: Account = {
          id: `${parsed.bankId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          bankId: parsed.bankId,
          bankName: parsed.bankName,
          accountNumber: '•••• ••••',
          currentBalance: parsed.balance ?? 0,
          currency: 'ETB',
          lastUpdated: new Date(timestamp).toISOString(),
          source: 'sms',
        };
        account = newAccount;
        await saveAccountToDb(newAccount);
        currentAccounts.push(newAccount);
      }

      let balanceAfter = parsed.balance;
      if (balanceAfter == null) {
        balanceAfter = calculateBalance(
          account.currentBalance,
          parsed.type,
          parsed.amount,
        );
      }

      await updateAccountBalanceInDb(account.id, balanceAfter);
      account.currentBalance = balanceAfter;
      account.lastUpdated = new Date(timestamp).toISOString();

      const transaction: Transaction = {
        id: `txn-${hash}`,
        accountId: account.id,
        bankId: parsed.bankId,
        bankName: parsed.bankName,
        type: parsed.type,
        amount: parsed.amount,
        balanceAfter,
        date: new Date(timestamp).toISOString(),
        rawSms: parsed.rawMessage,
        hash,
        currency: parsed.currency,
        sender: parsed.sender,
      };

      await saveTransactionToDb(transaction);
    }

    return currentAccounts;
  }, []);

  const syncSmsState = useCallback(async () => {
    setIsSyncing(true);
    try {
      const { SmsModule } = NativeModules;
      if (!SmsModule?.getInboxSms) {
        console.log('SmsModule.getInboxSms not available');
        return;
      }

      const inboxSms = await SmsModule.getInboxSms(0);
      const savedSms = SmsModule.getSavedSms
        ? await SmsModule.getSavedSms()
        : [];

      await clearAllTransactionsFromDb();
      await clearAllAccountsFromDb();

      const rebuiltAccounts = await ingestSmsMessages([
        ...(Array.isArray(inboxSms) ? inboxSms : []),
        ...(Array.isArray(savedSms) ? savedSms : []),
      ]);

      accountsRef.current = rebuiltAccounts;
      setAccounts(rebuiltAccounts);
      await loadTransactions();

      if (SmsModule.clearSavedSms) {
        await SmsModule.clearSavedSms();
      }
    } catch (error) {
      console.error('Error syncing SMS state:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [ingestSmsMessages, loadTransactions]);

  useEffect(() => {
    initializeDatabase();
    requestSmsPermissions();
  }, [requestSmsPermissions]);

  useEffect(() => {
    if (!dbReady || !smsPermissionsGranted) return;

    syncSmsState();

    const handleSms = async (data: {
      sender: string;
      message: string;
      timestamp: number;
    }) => {
      try {
        const { sender, message, timestamp } = data;
        const parsed = parseSms(message, sender);
        if (!parsed) {
          return;
        }

        const hash = generateSmsHash(message, sender, timestamp);
        const exists = await transactionExistsInDb(hash);
        if (exists) {
          return;
        }

        let account = accountsRef.current.find(a => a.bankId === parsed.bankId);

        if (!account) {
          const newAccount: Account = {
            id: `${parsed.bankId}-${Date.now()}`,
            bankId: parsed.bankId,
            bankName: parsed.bankName,
            accountNumber: '•••• ••••',
            currentBalance: parsed.balance ?? 0,
            currency: 'ETB',
            lastUpdated: new Date(timestamp).toISOString(),
            source: 'sms',
          };
          account = newAccount;
          await saveAccountToDb(newAccount);
          accountsRef.current = [...accountsRef.current, newAccount];
        }

        let balanceAfter = parsed.balance;
        if (balanceAfter == null) {
          balanceAfter = calculateBalance(
            account.currentBalance,
            parsed.type,
            parsed.amount,
          );
        }

        await updateAccountBalanceInDb(account.id, balanceAfter);
        accountsRef.current = accountsRef.current.map(a =>
          a.id === account!.id
            ? {
                ...a,
                currentBalance: balanceAfter!,
                lastUpdated: new Date(timestamp).toISOString(),
              }
            : a,
        );
        setAccounts(accountsRef.current);

        const transaction: Transaction = {
          id: `txn-${hash}`,
          accountId: account.id,
          bankId: parsed.bankId,
          bankName: parsed.bankName,
          type: parsed.type,
          amount: parsed.amount,
          balanceAfter,
          date: new Date(timestamp).toISOString(),
          rawSms: parsed.rawMessage,
          hash,
          currency: parsed.currency,
          sender: parsed.sender,
        };

        await saveTransactionToDb(transaction);
        setTransactions(prev => [transaction, ...prev]);
      } catch (error) {
        console.error('Error processing SMS:', error);
      }
    };

    nativeSmsService.addListener(handleSms);

    return () => {
      nativeSmsService.removeAllListeners();
    };
  }, [dbReady, smsPermissionsGranted, syncSmsState]);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      {!hasStarted ? (
        <WelcomeScreen onContinue={() => setHasStarted(true)} />
      ) : !dbReady || !smsPermissionsGranted || isSyncing ? (
        <SyncingScreen />
      ) : selectedAccount ? (
        <BankDetailScreen
          account={selectedAccount}
          onBack={() => setSelectedAccount(null)}
          transactions={getTransactionsForAccount(selectedAccount.id)}
        />
      ) : (
        <DashboardScreen 
          onSelectAccount={setSelectedAccount}
          accounts={accounts}
          transactions={transactions}
        />
      )}
    </SafeAreaProvider>
  );
}

export default App;
