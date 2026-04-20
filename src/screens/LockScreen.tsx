import { useEffect, useState } from 'react';
import { StyleSheet, View, Pressable, ActivityIndicator } from 'react-native';
import { AppText as Text } from '../components/AppText';;
import Svg, { Path, Circle } from 'react-native-svg';
import { Biometrics } from 'react-native-biometrics';

const FingerprintIcon = ({ size = 64, color = "#D7FF74" }) => (
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

  useEffect(() => {
    attemptBiometricUnlock();
  }, []);

  const attemptBiometricUnlock = async () => {
    setIsAuthenticating(true);
    try {
      const success = await onUnlockWithBiometrics();
      if (success) {
        onUnlock();
      }
    } catch (error) {
      console.log('Biometric authentication failed or not available');
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          {isAuthenticating ? (
            <ActivityIndicator color="#D7FF74" size="large" />
          ) : (
            <FingerprintIcon />
          )}
        </View>
        
        <Text style={styles.title}>Hisab is locked</Text>
        <Text style={styles.subtitle}>
          Use biometric authentication to unlock
        </Text>

        <Pressable
          style={styles.retryButton}
          onPress={attemptBiometricUnlock}
          disabled={isAuthenticating}
        >
          <Text style={styles.retryButtonText}>
            {isAuthenticating ? 'Authenticating...' : 'Try Again'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#122019',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#1A2A23',
    borderRadius: 32,
    padding: 40,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    color: '#F5F7F1',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    color: '#8AA094',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#1d674266',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#D7FF74',
    fontSize: 14,
    fontWeight: '700',
  },
});
