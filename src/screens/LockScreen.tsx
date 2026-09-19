import { useEffect, useState } from 'react';
import { StyleSheet, View, Pressable, ActivityIndicator } from 'react-native';
import { AppText as Text } from '../components/AppText';
import Svg, { Path } from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';
import type { ComponentProps, ComponentType } from 'react';

const GOLD = {
  gold: '#D8B45C',
  goldSoft: '#C9BB93',
  goldHighlight: '#2B2210',
  goldMid: '#17140D',
  goldDeep: '#0D0C09',
  border: 'rgba(216, 180, 92, 0.18)',
};

type LGProps = ComponentProps<typeof LinearGradient> & { type?: 'linear' | 'radial' };
const RadialGradient = LinearGradient as unknown as ComponentType<LGProps>;

const FingerprintIcon = ({ size = 84, color = GOLD.gold }) => (
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
      // Biometric auth failed
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
        <Text style={styles.brand}>ሂሳብ</Text>

        <Text style={styles.eyebrow}>Authentication required</Text>
        <Text style={styles.title}>Unlock Hisab</Text>

        <View style={styles.iconCard}>
          <LinearGradient
            colors={[GOLD.goldHighlight, GOLD.goldMid, GOLD.goldDeep]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          <View pointerEvents="none" style={[styles.blob, styles.blobTop]}>
            <RadialGradient
              type="radial"
              colors={['rgba(216, 180, 92, 0.32)', 'rgba(216, 180, 92, 0)']}
              style={StyleSheet.absoluteFill}
            />
          </View>
          <View pointerEvents="none" style={[styles.blob, styles.blobBottom]}>
            <RadialGradient
              type="radial"
              colors={['rgba(216, 180, 92, 0.16)', 'rgba(216, 180, 92, 0)']}
              style={StyleSheet.absoluteFill}
            />
          </View>

          <View pointerEvents="none" style={styles.goldBorder} />

          <FingerprintIcon />

          {isAuthenticating && (
            <View style={styles.loaderOverlay}>
              <ActivityIndicator color={GOLD.gold} size="large" />
            </View>
          )}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.unlockButton,
            pressed && styles.unlockButtonPressed,
          ]}
          onPress={attemptBiometricUnlock}
          disabled={isAuthenticating}>
          <Text style={styles.unlockButtonText}>
            {isAuthenticating ? 'Authenticating...' : 'Unlock Now'}
          </Text>
        </Pressable>

        <Text style={styles.hint}>Tap the fingerprint or press unlock to enter</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  brand: {
    color: GOLD.gold,
    fontFamily: 'nokiapure',
    fontSize: 30,
    opacity: 0.9,
    marginBottom: 32,
  },
  eyebrow: {
    color: 'rgba(235, 235, 245, 0.60)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.44,
    textTransform: 'uppercase',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.8,
    marginTop: 4,
    marginBottom: 36,
    textAlign: 'center',
  },
  iconCard: {
    width: 132,
    height: 132,
    borderRadius: 999,
    borderCurve: 'continuous',
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 36,
  },
  blob: {
    borderRadius: 999,
    overflow: 'hidden',
    position: 'absolute',
  },
  blobTop: {
    height: 110,
    right: -24,
    top: -28,
    width: 110,
  },
  blobBottom: {
    bottom: -22,
    height: 80,
    right: 8,
    width: 80,
  },
  goldBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1,
    borderColor: GOLD.border,
    borderRadius: 999,
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 999,
  },
  unlockButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingVertical: 15,
    paddingHorizontal: 44,
    minWidth: 220,
    alignItems: 'center',
  },
  unlockButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  unlockButtonText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '700',
  },
  hint: {
    color: 'rgba(235, 235, 245, 0.30)',
    fontSize: 12.5,
    marginTop: 22,
    textAlign: 'center',
  },
});