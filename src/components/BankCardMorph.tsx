import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import Svg, { Line } from 'react-native-svg';
import { AppText as Text } from './AppText';
import { BankCard } from './BankCard';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { Account } from '../models';

export type ChipRect = { x: number; y: number; width: number; height: number };

const CARD_H = 182;
const OPEN_CONFIG = { tension: 150, friction: 14, useNativeDriver: false };
const CLOSE_DURATION = 190;

type BankCardMorphProps = {
  account: Account | null;
  fromRect: ChipRect | null;
  transactionCount: number;
  isBalanceHidden: boolean;
  onToggleBalanceHidden: () => void;
  onClose: () => void;
  onOpenTransactions: () => void;
};

export function BankCardMorph({
  account,
  fromRect,
  transactionCount,
  isBalanceHidden,
  onToggleBalanceHidden,
  onClose,
  onOpenTransactions,
}: BankCardMorphProps) {
  const reduceMotion = useReducedMotion();
  const { width: winW, height: winH } = useWindowDimensions();
  const [isMounted, setIsMounted] = useState(false);
  const [chipRect, setChipRect] = useState<ChipRect | null>(null);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!account || !fromRect) {
      if (!isMounted) {
        return;
      }
      progress.stopAnimation();
      Animated.timing(progress, {
        toValue: 0,
        duration: reduceMotion ? 0 : CLOSE_DURATION,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: false,
      }).start(() => {
        setIsMounted(false);
        setChipRect(null);
      });
      return;
    }

    setChipRect(fromRect);
    setIsMounted(true);
    progress.setValue(reduceMotion ? 1 : 0);
    if (reduceMotion) {
      return;
    }
    Animated.spring(progress, {
      toValue: 1,
      ...OPEN_CONFIG,
    }).start();
  }, [account, fromRect, isMounted, progress, reduceMotion]);

  const CARD_W = winW - 40;
  const CARD_X = 20;
  const CARD_Y = Math.max(56, Math.round((winH - CARD_H) / 2) - 44);

  const tx = chipRect ? chipRect.x + chipRect.width / 2 - (CARD_X + CARD_W / 2) : 0;
  const ty = chipRect ? chipRect.y + chipRect.height / 2 - (CARD_Y + CARD_H / 2) : 0;
  const scaleX0 = chipRect ? chipRect.width / CARD_W : 1;
  const scaleY0 = chipRect ? chipRect.height / CARD_H : 1;
  const radius0 = chipRect ? Math.round(chipRect.width * 0.26) : 20;

  const animTranslateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [tx, 0],
    extrapolate: 'clamp',
  });
  const animTranslateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [ty, 0],
    extrapolate: 'clamp',
  });
  const animScaleX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [scaleX0, 1],
    extrapolate: 'clamp',
  });
  const animScaleY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [scaleY0, 1],
    extrapolate: 'clamp',
  });
  const animRadius = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [radius0, 20],
    extrapolate: 'clamp',
  });
  const backdropOpacity = progress.interpolate({
    inputRange: [0, 0.4],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const chromeOpacity = progress.interpolate({
    inputRange: [0.6, 1],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <Modal
      visible={isMounted}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}>
      <View style={styles.container}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="dark"
            blurAmount={8}
            blurRadius={12}
            overlayColor="rgba(0, 0, 0, 0.45)"
            reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.90)"
          />
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Dismiss bank card"
          />
        </Animated.View>

        {account && (
          <Animated.View
            style={[
              styles.card,
              {
                left: CARD_X,
                top: CARD_Y,
                width: CARD_W,
                height: CARD_H,
                borderRadius: animRadius,
                transform: [
                  { translateX: animTranslateX },
                  { translateY: animTranslateY },
                  { scaleX: animScaleX },
                  { scaleY: animScaleY },
                ],
              },
            ]}>
            <BankCard
              account={account}
              transactionCount={transactionCount}
              isBalanceHidden={isBalanceHidden}
              onToggleBalanceHidden={onToggleBalanceHidden}
              onPress={onOpenTransactions}
            />
          </Animated.View>
        )}

        <Animated.View
          style={[styles.closeBtn, { top: CARD_Y - 42, opacity: chromeOpacity }]}>
          <Pressable
            onPress={onClose}
            hitSlop={12}
            style={styles.closeBtnInner}
            accessibilityRole="button"
            accessibilityLabel="Close bank card">
            <Svg
              width={14}
              height={14}
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeLinecap="round">
              <Line x1="18" y1="6" x2="6" y2="18" />
              <Line x1="6" y1="6" x2="18" y2="18" />
            </Svg>
          </Pressable>
        </Animated.View>

        <Animated.View
          style={[styles.hint, { top: CARD_Y + CARD_H + 20, opacity: chromeOpacity }]}>
          <Text style={styles.hintText}>Tap the card to view transactions</Text>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  card: {
    overflow: 'hidden',
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 10,
  },
  closeBtn: {
    position: 'absolute',
    right: 28,
  },
  closeBtnInner: {
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 15,
    borderWidth: 1,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  hint: {
    alignItems: 'center',
    alignSelf: 'center',
    position: 'absolute',
  },
  hintText: {
    color: 'rgba(235, 235, 245, 0.30)',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
});