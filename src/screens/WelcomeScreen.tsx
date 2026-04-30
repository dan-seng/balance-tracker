import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, Dimensions } from 'react-native';
import { AppText as Text } from '../components/AppText';

import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';

const { height } = Dimensions.get('window');

type WelcomeScreenProps = {
  onContinue: () => void;
};

export function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

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

    // Continuous smooth floating animation for abstract shapes
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeAnim, slideAnim, floatAnim]);

  const floatY1 = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  const floatY2 = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 15],
  });

  const floatY3 = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -25],
  });

  return (
    <Screen>
      <View style={styles.wrapper}>
        
        {/* Glow Effects (Soft colored orbs in background) */}
        <View style={styles.glowTopRight} pointerEvents="none" />
        <View style={styles.glowCenterLeft} pointerEvents="none" />
        <View style={styles.glowBottomRight} pointerEvents="none" />

        {/* Abstract glass-like floating shapes symbolizing receipts and coins */}
        <Animated.View 
          style={[
            styles.floatingCard1,
            { opacity: fadeAnim, transform: [{ translateY: floatY1 }, { rotate: '-12deg' }] }
          ]} 
          pointerEvents="none" 
        />
        <Animated.View 
          style={[
            styles.floatingCard2,
            { opacity: fadeAnim, transform: [{ translateY: floatY2 }, { rotate: '18deg' }] }
          ]} 
          pointerEvents="none" 
        />
        <Animated.View 
          style={[
            styles.floatingCard3,
            { opacity: fadeAnim, transform: [{ translateY: floatY3 }, { scale: 0.95 }] }
          ]} 
          pointerEvents="none" 
        />

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
          <PrimaryButton label="Build My Wallet" onPress={onContinue} />
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
  glowTopRight: {
    position: 'absolute',
    top: -100,
    right: -50,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#4ade80', // vivid green representing money/growth
    opacity: 0.12,
  },
  glowCenterLeft: {
    position: 'absolute',
    top: height * 0.35,
    left: -120,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#3b82f6', // trusted blue
    opacity: 0.1,
  },
  glowBottomRight: {
    position: 'absolute',
    bottom: -50,
    right: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#a855f7', // premium purple
    opacity: 0.1,
  },
  floatingCard1: {
    position: 'absolute',
    top: height * 0.15,
    right: -20,
    width: 140,
    height: 180,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  floatingCard2: {
    position: 'absolute',
    top: height * 0.45,
    left: -30,
    width: 120,
    height: 160,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  floatingCard3: {
    position: 'absolute',
    bottom: height * 0.25,
    right: 40,
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
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
    fontFamily: 'nokiapure',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 34,
    letterSpacing: -1.5,
    lineHeight: 52,
    marginBottom: 20,
    fontFamily: 'Poppins-Bold',
  },
  titleAccent: {
    fontFamily: 'Poppins-Bold',
    color: '#b0b0b0ff', 
  },
  subtitle: {
    color: '#656565ff',
    fontSize: 16,
    lineHeight: 26,
    fontWeight: '400',
    maxWidth: '90%',
  },
});
