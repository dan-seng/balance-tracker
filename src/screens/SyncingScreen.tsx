import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { AppText as Text } from '../components/AppText';;

import { Screen } from '../components/Screen';

export function SyncingScreen() {
  return (
    <Screen>
      <View style={styles.wrapper}>
        <View style={styles.panel}>
          <Text style={styles.badge}>Hisab</Text>
          <Text style={styles.title}>Syncing your SMS wallet</Text>
          <Text style={styles.subtitle}>
            We are scanning your messages and rebuilding balances before the
            dashboard opens.
          </Text>

          <View style={styles.loaderRow}>
            <ActivityIndicator color="#FFFFFF" size="small" />
            <Text style={styles.loaderText}>Reading bank messages...</Text>
          </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  panel: {
    backgroundColor: '#181818',
    borderRadius: 28,
    padding: 28,
    borderWidth: 1,
    borderColor: '#333333',
  },
  badge: {
    color: '#bbbdbfff',
    fontSize: 24,
    letterSpacing: 2,
    marginBottom: 16,
    fontFamily: 'nokiapure',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -1,
    lineHeight: 36,
  },
  subtitle: {
    color: '#8A8A8A',
    fontSize: 15,
    lineHeight: 24,
    marginTop: 14,
  },
  loaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginTop: 26,
  },
  loaderText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
