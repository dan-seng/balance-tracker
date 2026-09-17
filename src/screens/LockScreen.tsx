import { useEffect, useState } from 'react';
import { StyleSheet, View, Pressable, ActivityIndicator } from 'react-native';
import { AppText as Text } from '../components/AppText';
import { theme } from '../theme';
import Svg, { Path } from 'react-native-svg';

const FingerprintIcon = ({ size = 80, color = theme.colors.primary }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 6" />
    <Path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 6-6 6 6 0 0 1 6 6c0 2 1 6 5 6" />
    <Path d="M12 12v.01" />
    <Path d="M17 16.95a7 7 0 0 0 1.75-2.45" />
    <Path d="M11 20a8 8 0 0 0 5.25-1.5" />
  </Svg>
);

type LockScreenProps = {
  onUnlock: () => void;
  onUnlockWithBiometrics: () => Promise<boolean>;
};

export function LockScreen({ onUnlock, onUnlockWithBiometrics }: LockScreenProps) {
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const attemptBiometricUnlock = async () => {
    setIsAuthenticating(true);
    try {
      const success = await onUnlockWithBiometrics();
      if (success) {
        onUnlock();
      }
    } catch {
      console.log('Biometric authentication failed or not available');
    } finally {
      setIsAuthenticating(false);
    }
  };

  useEffect(() => {
    attemptBiometricUnlock();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <FingerprintIcon />
          {isAuthenticating && (
            <View style={styles.loaderOverlay}>
              <ActivityIndicator color={theme.colors.primary} size="large" />
            </View>
          )}
        </View>
        
        <Text style={styles.title}>Hisab Locked</Text>
        <Text style={styles.subtitle}>
          Authentication required
        </Text>

        <Pressable
          style={styles.unlockButton}
          onPress={attemptBiometricUnlock}
          disabled={isAuthenticating}
        >
          <Text style={styles.unlockButtonText}>
            {isAuthenticating ? 'Authenticating...' : 'Unlock Now'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    marginBottom: 40,
    position: 'relative',
    padding: 20,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 100,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.xxl,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.md,
    textAlign: 'center',
    marginBottom: 48,
  },
  unlockButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.xl,
    paddingVertical: 14,
    paddingHorizontal: 40,
    minWidth: 200,
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  unlockButtonText: {
    color: theme.colors.background,
    fontSize: theme.typography.sizes.md,
    fontWeight: '700',
  },
});
