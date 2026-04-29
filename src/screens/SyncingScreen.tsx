import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { AppText as Text } from '../components/AppText';
import { theme } from '../theme';
import { Screen } from '../components/Screen';

export function SyncingScreen() {
  return (
    <Screen>
      <View style={styles.wrapper}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
        <Text style={styles.loaderText}>Loading...</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loaderText: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.md,
    fontWeight: '600',
    letterSpacing: 1,
    opacity: 0.8,
  },
});
