import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { useReducedMotion } from '../hooks/useReducedMotion';

type ShareBarProps = {
  pct: number;
  color: string;
  height?: number;
  delay?: number;
};

export function ShareBar({ pct, color, height = 8, delay = 0 }: ShareBarProps) {
  const reduceMotion = useReducedMotion();
  const progress = useRef(new Animated.Value(0)).current;
  const previous = useRef(0);

  useEffect(() => {
    const from = previous.current;
    previous.current = Math.max(0, Math.min(pct, 100));

    if (reduceMotion) {
      progress.setValue(previous.current);
      return;
    }

    progress.setValue(from);
    const animation = Animated.timing(progress, {
      toValue: previous.current,
      duration: 460,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });

    animation.start();

    return () => animation.stop();
  }, [pct, delay, reduceMotion, progress]);

  const width = progress.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }]}>
      <Animated.View
        style={[
          styles.fill,
          { width, backgroundColor: color, borderRadius: height / 2 },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    height: '100%',
  },
});
