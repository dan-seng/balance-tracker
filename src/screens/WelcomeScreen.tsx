import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { AppText as Text } from '../components/AppText';;

import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';

type WelcomeScreenProps = {
  onContinue: () => void;
};

export function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Staggered entry animation for elements
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  return (
    <Screen>
      <View style={styles.wrapper}>
        
        {/* Subtle, massive background vignette to give depth without clutter */}
        <View style={styles.backgroundVignette} pointerEvents="none" />

        <Animated.View 
          style={[
            styles.content, 
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}>
          <Text style={styles.badge}>ሒሳብ</Text>
          <Text style={styles.title}>
            Track bank SMS {'\n'}
            <Text style={styles.titleAccent}>like a real wallet.</Text>
          </Text>
          <Text style={styles.subtitle}>
            Read incoming bank messages, structure them locally, and turn them
            into a clean financial timeline.
          </Text>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim }}>
          <PrimaryButton label="Start Building My Wallet" onPress={onContinue} />
        </Animated.View>

      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 24,
    paddingTop: 80,
  },
  backgroundVignette: {
    position: 'absolute',
    top: -150,
    left: 150,
    width: 400,
    height: 300,
    borderRadius: 999,
    backgroundColor: '#ffffffff',
    opacity: 0.08, // Barely visible, just adds a premium sheen
  },
  content: {
    paddingHorizontal: 8,
    zIndex: 1,
  },
  badge: {
    color: '#ffffffff',
    fontSize: 52,
    letterSpacing: 2,
    marginBottom: 32,
    fontFamily: 'nokiapure'
  },
  title: {
    color: '#FFFFFF',
    fontSize: 44,
    letterSpacing: -1.5,
    lineHeight: 52,
    marginBottom: 20,
     fontFamily: 'Poppins-Bold',
  },
  titleAccent: {
    fontFamily: 'Poppins-Bold',
    color: '#b0b0b0ff', // A classy, muted sage tone for the second half
  },
  subtitle: {
    color: '#656565ff',
    fontSize: 16,
    lineHeight: 26,
    fontWeight: '400',
    maxWidth: '90%',
  },
});
