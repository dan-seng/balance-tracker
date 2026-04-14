import { useState } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Account } from './src/models';
import { BankDetailScreen } from './src/screens/BankDetailScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { getTransactionsForAccount } from './src/services/mockDataService';
import { WelcomeScreen } from './src/screens/WelcomeScreen';

function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      {!hasStarted ? (
        <WelcomeScreen onContinue={() => setHasStarted(true)} />
      ) : selectedAccount ? (
        <BankDetailScreen
          account={selectedAccount}
          onBack={() => setSelectedAccount(null)}
          transactions={getTransactionsForAccount(selectedAccount.id)}
        />
      ) : (
        <DashboardScreen onSelectAccount={setSelectedAccount} />
      )}
    </SafeAreaProvider>
  );
}

export default App;
