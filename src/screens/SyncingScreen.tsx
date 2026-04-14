import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

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
            <ActivityIndicator color="#D7FF74" size="small" />
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
    backgroundColor: '#14241D',
    borderRadius: 28,
    padding: 28,
  },
  badge: {
    color: '#D7FF74',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  title: {
    color: '#F8FAF5',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -1,
    lineHeight: 36,
  },
  subtitle: {
    color: '#B8C4BB',
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
    color: '#D7FF74',
    fontSize: 14,
    fontWeight: '700',
  },
});
