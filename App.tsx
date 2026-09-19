import { useCallback, useEffect, useRef, useState } from 'react';
import { StatusBar, Alert, View, AppState, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import ReactNativeBiometrics from 'react-native-biometrics';

import { Account, ParsedSms, Transaction } from './src/models';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { LockScreen } from './src/screens/LockScreen';
import { SyncingScreen } from './src/screens/SyncingScreen';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { NameEntryScreen } from './src/screens/NameEntryScreen';
import { AnalyticsScreen } from './src/screens/AnalyticsScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { AddBankScreen } from './src/screens/AddBankScreen';
import { BottomNav, TabType } from './src/components/BottomNav';
import { clearAllAccountsFromDb, clearAllTransactionsFromDb, getAccountsFromDb, getTransactionsFromDb, initDatabase, saveAccountToDb, saveTransactionToDb, transactionExistsInDb, updateAccountBalanceInDb, setUserNameInDb, getUserNameFromDb, setBalanceHiddenInDb, getBalanceHiddenFromDb, setUserTitleInDb, getUserTitleFromDb, saveCustomBankInDb, getCustomBanksFromDb, deleteCustomBankFromDb, setAppLockedInDb, getAppLockedFromDb, setAutoLockTimeoutInDb, getAutoLockTimeoutFromDb } from './src/db';
import { nativeSmsService } from './src/services/nativeSmsService';
import { parseSms } from './src/services/parserService';
import { setCustomBanks as setCustomBanksInParser } from './src/parsers/genericParser';
import { calculateBalance, generateSmsHash } from './src/utils/balanceUtils';
import { getMockSmsMessages, NEW_BANKS } from './src/mocks/mockSmsData';
import { mergeAccountsToDb, renameAccountToDb } from './src/db';

// TEMPORARY: switch to mock SMS data instead of reading the real phone inbox.
// Set this back to false to return to reading real SMS.
const USE_MOCK_DATA = false;

function accountDigits(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = raw.replace(/[^\d]/g, '');
  return digits.length >= 4 ? digits : null;
}

function toDisplayAccountNumber(hint: string | null | undefined): string {
  if (!hint) return '•••• ••••';
  const digits = hint.replace(/[^\d]/g, '');
  if (digits.length >= 6) return digits;
  if (digits.length >= 4) return `•••• ${digits.slice(-4)}`;
  return '•••• ••••';
}

function findAccountForSms(
  accounts: Account[],
  parsed: ParsedSms,
  subId?: number | null,
): Account | null {
  const candidates = accounts.filter(a => a.bankId === parsed.bankId);
  if (candidates.length === 0) return null;

  const hintDigits = accountDigits(parsed.accountNumberHint);
  if (hintDigits) {
    for (const candidate of candidates) {
      const candidateDigits = accountDigits(candidate.accountNumber);
      if (!candidateDigits) continue;
      const matchesFull =
        candidateDigits.length >= 6 &&
        hintDigits.length >= 6 &&
        candidateDigits === hintDigits;
      const matchesLast4 = candidateDigits.slice(-4) === hintDigits.slice(-4);
      if (matchesFull || matchesLast4) return candidate;
    }
  }

  if (subId != null) {
    const bySub = candidates.find(a => a.subId === subId);
    if (bySub) return bySub;
  }

  // Legacy glue: a sole account that carries no identity yet will absorb a
  // message that reveals nothing distinguishing. Never glue onto an account
  // that is already identified but failed to match — that would merge balances
  // from a second SIM into the wrong wallet.
  if (candidates.length === 1) {
    const only = candidates[0];
    const onlyDigits = accountDigits(only.accountNumber);
    const unidentified = onlyDigits == null && only.subId == null;
    if (unidentified) return only;
  }

  return null;
}

// Upgrades an existing account with identity details learned from a newer SMS.
// Returns true when persisted fields changed.
function applyAccountIdentity(
  account: Account,
  parsed: ParsedSms,
  subId?: number | null,
): boolean {
  let changed = false;
  if (subId != null && account.subId == null) {
    account.subId = subId;
    changed = true;
  }
  const hintDigits = accountDigits(parsed.accountNumberHint);
  const storedDigits = accountDigits(account.accountNumber);
  if (hintDigits && storedDigits && hintDigits.length > storedDigits.length) {
    account.accountNumber = toDisplayAccountNumber(parsed.accountNumberHint);
    changed = true;
  }
  return changed;
}

function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dbReady, setDbReady] = useState(false);
  const [smsPermissionsGranted, setSmsPermissionsGranted] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAppLocked, setIsAppLocked] = useState(false);
  const [showLockScreen, setShowLockScreen] = useState(false);
  const [autoLockTimeout, setAutoLockTimeout] = useState(0); // 0 = immediately, -1 = never
  const [lastActiveTime, setLastActiveTime] = useState(Date.now());
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  const [accountBalanceHidden, setAccountBalanceHidden] = useState<Record<string, boolean>>({});
  const [userTitle, setUserTitle] = useState<string | null>(null);
  const [customBanks, setCustomBanks] = useState<Array<{ bankId: string; bankName: string; senderId: string; logoBase64: string | null }>>([]);
  const accountsRef = useRef<Account[]>([]);
  const skipLockScreenRef = useRef(false);
  const hasSyncedRef = useRef(false);

  const rnBiometrics = new ReactNativeBiometrics({
    allowDeviceCredentials: true,
  });

  useEffect(() => {
    if (skipLockScreenRef.current) {
      skipLockScreenRef.current = false;
      return;
    }
    if (isAppLocked && hasStarted && userName && dbReady && !isSyncing) {
      setShowLockScreen(true);
    } else {
      setShowLockScreen(false);
    }
  }, [isAppLocked, hasStarted, userName, dbReady, isSyncing]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active' && isAppLocked && hasStarted && userName && dbReady && !isSyncing) {
        // Check if auto-lock timeout has elapsed
        if (autoLockTimeout === -1) {
          // Never auto-lock, don't show lock screen on app return
          return;
        }

        const timeSinceLastActive = Date.now() - lastActiveTime;
        const timeoutMs = autoLockTimeout * 60 * 1000;

        if (autoLockTimeout === 0 || timeSinceLastActive >= timeoutMs) {
          setShowLockScreen(true);
        }
      } else if (nextAppState === 'active') {
        // Update last active time when app becomes active
        setLastActiveTime(Date.now());
      }
    });

    return () => subscription.remove();
  }, [isAppLocked, hasStarted, userName, dbReady, isSyncing, autoLockTimeout, lastActiveTime]);

  const handleUnlockWithBiometrics = async (): Promise<boolean> => {
    try {
      const result = await rnBiometrics.simplePrompt({
        promptMessage: 'Authenticate to unlock Hisab',
        cancelButtonText: 'Cancel',
      });

      if (result.success) {
        setShowLockScreen(false);
        return true;
      }
      return false;
    } catch (error) {
      console.log('Biometric authentication error:', error);
      return false;
    }
  };

  const handleToggleBalanceHidden = async () => {
    const newState = !isBalanceHidden;
    setIsBalanceHidden(newState);
    await setBalanceHiddenInDb(newState);
  };

  const handleToggleAccountBalanceHidden = (accountId: string) => {
    setAccountBalanceHidden(prev => ({
      ...prev,
      [accountId]: !prev[accountId],
    }));
  };

  const handleToggleLock = async () => {
    const newLockState = !isAppLocked;
    
    if (newLockState) {
      // Try to enable biometric authentication first
      try {
        const result = await rnBiometrics.simplePrompt({
          promptMessage: 'Authenticate to enable app lock',
          cancelButtonText: 'Cancel',
        });

        if (result.success) {
          setIsAppLocked(true);
          await setAppLockedInDb(true);
        }
      } catch (error) {
        console.log('Failed to enable biometric lock:', error);
        Alert.alert(
          'Authentication Failed',
          'Could not enable app lock. Biometric authentication may not be available on this device.'
        );
      }
    } else {
      // Disable lock
      setIsAppLocked(false);
      await setAppLockedInDb(false);
    }
  };

  useEffect(() => {
    accountsRef.current = accounts;
  }, [accounts]);

  const initializeDatabase = async () => {
    try {
      await initDatabase();
      const savedName = await getUserNameFromDb();
      if (savedName) {
        setUserName(savedName);
        setHasStarted(true);
      }
      const savedBalanceHidden = await getBalanceHiddenFromDb();
      setIsBalanceHidden(savedBalanceHidden);
      const savedTitle = await getUserTitleFromDb();
      setUserTitle(savedTitle);
      const savedCustomBanks = await getCustomBanksFromDb();
      setCustomBanks(savedCustomBanks);
      
      const savedAppLocked = await getAppLockedFromDb();
      setIsAppLocked(savedAppLocked);
      
      const savedTimeout = await getAutoLockTimeoutFromDb();
      setAutoLockTimeout(savedTimeout);

      setDbReady(true);
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  };

  const ensureCustomBankAccounts = useCallback(
    async (
      banks: Array<{ bankId: string; bankName: string; senderId: string; logoBase64: string | null }>,
      current: Account[],
    ): Promise<Account[]> => {
      let next = current;
      for (const bank of banks) {
        if (next.some(a => a.bankId === bank.bankId)) {
          continue;
        }
        const placeholder: Account = {
          id: `${bank.bankId}-account`,
          bankId: bank.bankId,
          bankName: bank.bankName,
          accountNumber: '•••• ••••',
          currentBalance: 0,
          currency: 'ETB',
          lastUpdated: new Date().toISOString(),
          source: 'sms',
        };
        await saveAccountToDb(placeholder);
        next = [...next, placeholder];
      }
      return next;
    },
    [],
  );

  const handleAddCustomBank = async (bankName: string, senderId: string, logoBase64: string | null) => {
    const bankId = `custom-${Date.now()}`;
    await saveCustomBankInDb(bankId, bankName, senderId, logoBase64);
    const updatedBanks = [...customBanks, { bankId, bankName, senderId, logoBase64 }];
    setCustomBanks(updatedBanks);

    const updatedAccounts = await ensureCustomBankAccounts(updatedBanks, accountsRef.current);
    accountsRef.current = updatedAccounts;
    setAccounts(updatedAccounts);
  };

  const handleDeleteCustomBank = async (bankId: string) => {
    await deleteCustomBankFromDb(bankId);
    const updatedBanks = customBanks.filter(b => b.bankId !== bankId);
    setCustomBanks(updatedBanks);
  };

  // Update parser with custom banks when they change
  useEffect(() => {
    setCustomBanksInParser(customBanks);
  }, [customBanks]);

  const loadTransactions = useCallback(async () => {
    try {
      const loadedTransactions = await getTransactionsFromDb();
      setTransactions(loadedTransactions);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  }, []);

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
    smsMessages: Array<{ sender: string; message: string; timestamp: number; subId?: number | null }>,
  ) => {
    const currentAccounts = await getAccountsFromDb();
    const orderedMessages = [...smsMessages].sort(
      (left, right) => left.timestamp - right.timestamp,
    );

    for (const sms of orderedMessages) {
      const { sender, message, timestamp, subId } = sms;
      const parsed = parseSms(message, sender);
      if (!parsed || parsed.bankId === 'unknown') {
        continue;
      }

      const hash = generateSmsHash(message, sender, timestamp);
      const exists = await transactionExistsInDb(hash);
      if (exists) {
        continue;
      }

      let account = findAccountForSms(currentAccounts, parsed, subId);

      if (!account) {
        const newAccount: Account = {
          id: `${parsed.bankId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          bankId: parsed.bankId,
          bankName: parsed.bankName,
          accountNumber: toDisplayAccountNumber(parsed.accountNumberHint),
          currentBalance: parsed.balance ?? 0,
          currency: 'ETB',
          lastUpdated: new Date(timestamp).toISOString(),
          source: 'sms',
          subId: subId != null ? subId : null,
        };
        account = newAccount;
        await saveAccountToDb(newAccount);
        currentAccounts.push(newAccount);
      } else if (applyAccountIdentity(account, parsed, subId)) {
        await saveAccountToDb(account);
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
      await clearAllTransactionsFromDb();
      await clearAllAccountsFromDb();

      // Read real SMS data natively (or use mock data while USE_MOCK_DATA is on)
      const smsData = USE_MOCK_DATA
        ? getMockSmsMessages()
        : await nativeSmsService.getInboxSms(5000);
      if (USE_MOCK_DATA) {
        setCustomBanksInParser([...customBanks, ...NEW_BANKS]);
      }
      const rebuiltAccounts = await ingestSmsMessages(smsData);

      const mergedAccounts = await ensureCustomBankAccounts(customBanks, rebuiltAccounts);
      accountsRef.current = mergedAccounts;
      setAccounts(mergedAccounts);
      await loadTransactions();
      // Mocking, no need to clear saved SMS
    } catch (error) {
      console.error('Error syncing SMS state:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [ingestSmsMessages, loadTransactions, customBanks, ensureCustomBankAccounts]);

  const loadSampleTransactions = useCallback(async () => {
    setIsSyncing(true);
    try {
      await clearAllTransactionsFromDb();
      await clearAllAccountsFromDb();

      const allBanks = [...customBanks, ...NEW_BANKS];
      setCustomBanksInParser(allBanks);

      const rebuiltAccounts = await ingestSmsMessages(getMockSmsMessages());

      const mergedAccounts = await ensureCustomBankAccounts(allBanks, rebuiltAccounts);
      accountsRef.current = mergedAccounts;
      setAccounts(mergedAccounts);
      await loadTransactions();
    } catch (error) {
      console.error('Error loading sample transactions:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [ingestSmsMessages, loadTransactions, customBanks, ensureCustomBankAccounts]);

  const handleRenameAccount = useCallback(
    async (accountId: string, newBankName: string) => {
      try {
        await renameAccountToDb(accountId, newBankName);
        const updated = await getAccountsFromDb();
        accountsRef.current = updated;
        setAccounts(updated);
        await loadTransactions();
      } catch (error) {
        console.error('Error renaming account:', error);
      }
    },
    [loadTransactions],
  );

  const handleMergeAccounts = useCallback(
    async (sourceId: string, targetId: string) => {
      try {
        await mergeAccountsToDb(sourceId, targetId);
        const updated = await getAccountsFromDb();
        accountsRef.current = updated;
        setAccounts(updated);
        await loadTransactions();
      } catch (error) {
        console.error('Error merging accounts:', error);
      }
    },
    [loadTransactions],
  );

  useEffect(() => {
    initializeDatabase();
    requestSmsPermissions();
  }, [requestSmsPermissions]);

  useEffect(() => {
    if (!dbReady || !smsPermissionsGranted) return;

    if (hasSyncedRef.current) {
      // Already synced once — just reload from DB
      (async () => {
        const loadedAccounts = await getAccountsFromDb();
        accountsRef.current = loadedAccounts;
        setAccounts(loadedAccounts);
        await loadTransactions();
      })();
      return;
    }

    syncSmsState().then(() => {
      hasSyncedRef.current = true;
    });

    if (USE_MOCK_DATA) {
      return;
    }

    const handleSms = async (data: {
      sender: string;
      message: string;
      timestamp: number;
      subId?: number | null;
    }) => {
      try {
        const { sender, message, timestamp, subId } = data;
        const parsed = parseSms(message, sender);
        if (!parsed) {
          return;
        }

        const hash = generateSmsHash(message, sender, timestamp);
        const exists = await transactionExistsInDb(hash);
        if (exists) {
          return;
        }

        let account = findAccountForSms(accountsRef.current, parsed, subId);

        if (!account) {
          const newAccount: Account = {
            id: `${parsed.bankId}-${Date.now()}`,
            bankId: parsed.bankId,
            bankName: parsed.bankName,
            accountNumber: toDisplayAccountNumber(parsed.accountNumberHint),
            currentBalance: parsed.balance ?? 0,
            currency: 'ETB',
            lastUpdated: new Date(timestamp).toISOString(),
            source: 'sms',
            subId: subId != null ? subId : null,
          };
          account = newAccount;
          await saveAccountToDb(newAccount);
          accountsRef.current = [...accountsRef.current, newAccount];
        } else if (applyAccountIdentity(account, parsed, subId)) {
          await saveAccountToDb(account);
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
      {showLockScreen ? (
        <LockScreen
          onUnlock={() => setShowLockScreen(false)}
          onUnlockWithBiometrics={handleUnlockWithBiometrics}
        />
      ) : !hasStarted ? (
        <WelcomeScreen onContinue={() => setHasStarted(true)} />
      ) : !userName ? (
        <NameEntryScreen onNameSubmit={async (name, title) => {
          await setUserNameInDb(name);
          await setUserTitleInDb(title);
          setUserName(name);
          setUserTitle(title);
        }} />
      ) : !dbReady || !smsPermissionsGranted || isSyncing ? (
        <SyncingScreen />
      ) : (
        <View style={styles.tabContainer}>
          {currentTab === 'dashboard' ? (
            <DashboardScreen
              userName={userName!}
              accounts={accounts}
              transactions={transactions}
              onToggleLock={handleToggleLock}
              isAppLocked={isAppLocked}
              isBalanceHidden={isBalanceHidden}
              onToggleBalanceHidden={handleToggleBalanceHidden}
              accountBalanceHidden={accountBalanceHidden}
              onToggleAccountBalanceHidden={handleToggleAccountBalanceHidden}
              userTitle={userTitle}
              customBanks={customBanks}
            />
          ) : currentTab === 'analytics' ? (
            <AnalyticsScreen transactions={transactions} />
          ) : currentTab === 'addBank' ? (
            <AddBankScreen
              onAddBank={async (bankName, senderId, logoBase64) => {
                await handleAddCustomBank(bankName, senderId, logoBase64);
                setCurrentTab('dashboard');
              }}
              onCancel={() => setCurrentTab('dashboard')}
            />
          ) : (
            <SettingsScreen
              userName={userName!}
              onNameChange={async (name) => {
                skipLockScreenRef.current = true;
                await setUserNameInDb(name);
                setUserName(name);
              }}
              isAppLocked={isAppLocked}
              onToggleLock={handleToggleLock}
              autoLockTimeout={autoLockTimeout}
              onAutoLockTimeoutChange={async (timeout) => {
                setAutoLockTimeout(timeout);
                await setAutoLockTimeoutInDb(timeout);
              }}
              customBanks={customBanks}
              onAddCustomBank={handleAddCustomBank}
              onDeleteCustomBank={handleDeleteCustomBank}
              accounts={accounts}
              onRenameAccount={handleRenameAccount}
              onMergeAccounts={handleMergeAccounts}
            />
          )}
          <BottomNav currentTab={currentTab} onTabChange={setCurrentTab} />
        </View>
      )}
    </SafeAreaProvider>
  );
}

export default App;

const styles = StyleSheet.create({
  tabContainer: {
    flex: 1,
  },
});
