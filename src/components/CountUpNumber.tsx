import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleProp, TextStyle } from 'react-native';

import { AppText as Text } from './AppText';
import { useReducedMotion } from '../hooks/useReducedMotion';

type CountUpNumberProps = {
  value: number;
  style?: StyleProp<TextStyle>;
  duration?: number;
  decimals?: number;
  formatter?: (value: number) => string;
  numberOfLines?: number;
  adjustsFontSizeToFit?: boolean;
  minimumFontScale?: number;
};

export function CountUpNumber({
  value,
  style,
  duration = 900,
  decimals = 0,
  formatter,
  numberOfLines,
  adjustsFontSizeToFit = false,
  minimumFontScale,
}: CountUpNumberProps) {
  const reduceMotion = useReducedMotion();
  const progress = useRef(new Animated.Value(0)).current;
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (reduceMotion) {
      setDisplayValue(value);
      return;
    }

    progress.setValue(0);
    const listenerId = progress.addListener(({ value: next }) =>
      setDisplayValue(next),
    );
    const animation = Animated.timing(progress, {
      toValue: value,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });

    animation.start();

    return () => {
      animation.stop();
      progress.removeListener(listenerId);
    };
  }, [value, duration, reduceMotion, progress]);

  const rounded =
    decimals > 0
      ? Number(displayValue.toFixed(decimals))
      : Math.round(displayValue);

  return (
    <Text
      style={style}
      numberOfLines={numberOfLines}
      adjustsFontSizeToFit={adjustsFontSizeToFit}
      minimumFontScale={minimumFontScale}>
      {formatter
        ? formatter(rounded)
        : rounded.toLocaleString(undefined, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          })}
    </Text>
  );
}