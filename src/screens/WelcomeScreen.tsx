import { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Screen } from '../components/Screen';
import { theme } from '../theme';

type WelcomeScreenProps = {
  onContinue: () => void;
};

type SlideKey = 'messages' | 'wallet' | 'lock';

type Slide = {
  key: SlideKey;
  title: string;
  description: string;
};

const slides: Slide[] = [
  {
    key: 'messages',
    title: 'Let your messages do the work',
    description:
      'Turn bank SMS into a clear, personal transaction timeline.',
  },
  {
    key: 'wallet',
    title: 'Your banks, together',
    description: 'Keep track of all of your balances in one place.',
  },
  {
    key: 'lock',
    title: 'Stays on your device',
    description:
      'Your messages are processed and stored locally. No cloud sync.',
  },
];

function ChatBubbleVisual() {
  return (
    <View style={styles.bubble}>
      <View style={styles.bubbleRow}>
        <View style={styles.bubbleAvatar}>
          <Text style={styles.bubbleAvatarText}>C</Text>
        </View>
        <View style={styles.bubbleMeta}>
          <Text style={styles.bubbleSender}>CBE</Text>
          <Text style={styles.bubbleLabel}>Transaction message</Text>
        </View>
      </View>
      <View style={styles.bubbleDivider} />
      <Text style={styles.bubbleAmount}>ETB 1,500.00</Text>
      <Text style={styles.bubbleNote}>Credited • Available 24,342.00</Text>
      <View style={styles.trackedPill}>
        <Text style={styles.trackedPillText}>TRACKED</Text>
      </View>
    </View>
  );
}

function BankCardsVisual() {
  return (
    <View style={styles.cardStack}>
      <View
        style={[
          styles.walletBankCard,
          styles.abyssiniaCard,
          styles.walletCardBackLeft,
        ]}>
        <View style={styles.cardSheen} />
        <Text style={styles.abyssiniaName}>ABYSSINIA BANK</Text>
        <Text style={styles.bankCardSub}>SINCE 1996</Text>
        <Text style={styles.bankCardNumber}>•••• •••• •••• 0427</Text>
        <Text style={styles.bankCardFooterTag}>DEBIT</Text>
      </View>
      <View
        style={[
          styles.walletBankCard,
          styles.telebirrCard,
          styles.walletCardBackRight,
        ]}>
        <View style={styles.cardSheen} />
        <View style={styles.cardFrontTop}>
          <View style={styles.telebirrMarkBox}>
            <Text style={styles.telebirrMarkText}>T</Text>
          </View>
          <Text style={styles.telebirrName}>Telebirr</Text>
        </View>
        <View>
          <Text style={styles.telebirrLabel}>Balance</Text>
          <Text style={styles.telebirrBalance}>ETB 1,250.00</Text>
        </View>
        <Text style={styles.bankCardFooterTag}>MOBILE MONEY</Text>
      </View>
      <View
        style={[styles.walletBankCard, styles.cbeCard, styles.walletCardFront]}>
        <View style={styles.cardSheen} />
        <View style={styles.cardFrontTop}>
          <View>
            <Text style={styles.cbeName}>CBE</Text>
            <Text style={styles.bankCardSub}>COMMERCIAL BANK OF ETHIOPIA</Text>
          </View>
          <View style={styles.cardChip}>
            <View style={styles.cardChipLine} />
            <View style={styles.cardChipLine} />
          </View>
        </View>
        <Text style={styles.bankCardNumber}>•••• •••• •••• 0423</Text>
        <View style={styles.cardFrontBottom}>
          <Text style={styles.bankCardFooterTag}>DEBIT</Text>
          <Text style={styles.bankCardFooterTag}>ETB</Text>
        </View>
      </View>
    </View>
  );
}

function LockVisual() {
  return (
    <View style={styles.shieldWrap}>
      <Svg
        width={120}
        height={120}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round">
        <Path d="M12 2.5l7.5 3.5v5.5c0 4.7-3.2 8.3-7.5 9.5-4.3-1.2-7.5-4.8-7.5-9.5V6z" />
        <Path d="M9.2 12l2 2 3.6-4" />
      </Svg>
      <View style={styles.onDevicePill}>
        <Text style={styles.onDevicePillText}>NO CLOUD</Text>
      </View>
    </View>
  );
}

function SlideVisual({ name }: { name: SlideKey }) {
  if (name === 'messages') {
    return <ChatBubbleVisual />;
  }
  if (name === 'wallet') {
    return <BankCardsVisual />;
  }
  return <LockVisual />;
}

export function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
  const { width, height } = useWindowDimensions();
  const isCompact = height < 700;
  const [reduceMotion, setReduceMotion] = useState(false);
  const [pagerWidth, setPagerWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollX = useRef(new Animated.Value(0)).current;
  const pagerRef = useRef<ScrollView>(null);

  useEffect(() => {
    let isMounted = true;

    AccessibilityInfo.isReduceMotionEnabled().then(enabled => {
      if (isMounted) {
        setReduceMotion(enabled);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const isLastSlide = activeIndex === slides.length - 1;

  const goToSlide = (index: number) => {
    pagerRef.current?.scrollTo({ x: index * pagerWidth, animated: true });
  };

  const handleContinue = () => {
    if (isLastSlide) {
      onContinue();
    } else {
      goToSlide(activeIndex + 1);
    }
  };

  const gear = (inputRange: number[]) => ({
    inputRange,
    outputRange: [0, 1, 0],
    extrapolate: 'clamp' as const,
  });

  const renderDot = (index: number) => {
    const current = index * pagerWidth;
    const dotWidth = scrollX.interpolate({
      inputRange: [current - pagerWidth, current, current + pagerWidth],
      outputRange: [7, 22, 7],
      extrapolate: 'clamp',
    });
    const dotColor = scrollX.interpolate({
      inputRange: [current - pagerWidth, current, current + pagerWidth],
      outputRange: [
        'rgba(255, 255, 255, 0.3)',
        '#FFFFFF',
        'rgba(255, 255, 255, 0.3)',
      ],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        key={index}
        accessible={false}
        style={[styles.dot, { width: dotWidth, backgroundColor: dotColor }]}
      />
    );
  };

  return (
    <Screen scrollable>
      <View style={[styles.wrapper, { maxWidth: Math.min(width, 480) }]}>
        <View style={styles.header}>
          <View style={styles.brandBlock}>
            <Image
              source={require('../../assets/hisab.png')}
              style={styles.brandIcon}
              accessible={false}
            />
            <Text style={styles.brandName}>Hisab</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Skip introduction"
            onPress={onContinue}
            hitSlop={12}
            style={({ pressed }) => [pressed && styles.pressedDim]}>
            <Text style={styles.skip}>Skip</Text>
          </Pressable>
        </View>

        <Animated.ScrollView
          ref={pagerRef}
          horizontal
          pagingEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          scrollEnabled={pagerWidth > 0}
          onLayout={event => setPagerWidth(Math.round(event.nativeEvent.layout.width))}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false },
          )}
          scrollEventThrottle={16}
          onMomentumScrollEnd={event => {
            const index = Math.round(
              event.nativeEvent.contentOffset.x / pagerWidth,
            );
            setActiveIndex(index);
          }}>
          {slides.map((slide, index) => {
            const current = index * pagerWidth;
            const opacity = scrollX.interpolate(gear([current - pagerWidth, current, current + pagerWidth]));
            const translateX = scrollX.interpolate({
              inputRange: [current - pagerWidth, current, current + pagerWidth],
              outputRange: [pagerWidth * 0.12, 0, -pagerWidth * 0.12],
              extrapolate: 'clamp',
            });

            return (
              <View key={slide.key} style={[styles.slide, { width: pagerWidth }]}>
                <Animated.View
                  style={[
                    styles.slideContent,
                    reduceMotion
                      ? styles.slideContentStatic
                      : { opacity, transform: [{ translateX }] },
                  ]}>
                  <View style={styles.visualZone}>
                    <SlideVisual name={slide.key} />
                  </View>
                  <Text accessibilityRole="header" style={[styles.slideTitle, isCompact && styles.slideTitleCompact]}>
                    {slide.title}
                  </Text>
                  <Text style={styles.slideDescription}>{slide.description}</Text>
                </Animated.View>
              </View>
            );
          })}
        </Animated.ScrollView>

        <View style={styles.footer}>
          <View
            style={styles.dots}
            accessible={false}
            accessibilityElementsHidden>
            {slides.map((_, index) => renderDot(index))}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isLastSlide ? 'Get started' : 'Continue'}
            onPress={handleContinue}
            style={({ pressed }) => [
              styles.continueButton,
              pressed && styles.continueButtonPressed,
            ]}>
            <Text style={styles.continueLabel}>
              {isLastSlide ? 'Get Started' : 'Continue'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 16,
  },
  brandBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandIcon: {
    width: 26,
    height: 26,
    borderRadius: 7,
  },
  brandName: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  skip: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  pressedDim: {
    opacity: 0.6,
  },
  slide: {
    justifyContent: 'center',
  },
  slideContent: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  slideContentStatic: {
    opacity: 1,
  },
  visualZone: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 236,
    marginBottom: 12,
  },
  slideTitle: {
    color: theme.colors.text,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.8,
    lineHeight: 38,
    textAlign: 'center',
  },
  slideTitleCompact: {
    fontSize: 26,
    lineHeight: 34,
  },
  slideDescription: {
    color: '#98989F',
    fontSize: 17,
    lineHeight: 25,
    textAlign: 'center',
    marginTop: 12,
    maxWidth: 340,
  },
  bubble: {
    width: 264,
    borderRadius: 22,
    borderCurve: 'continuous',
    backgroundColor: '#151517',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bubbleAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  bubbleAvatarText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  bubbleMeta: {
    gap: 1,
  },
  bubbleSender: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  bubbleLabel: {
    color: '#6E6E73',
    fontSize: 12,
  },
  bubbleDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    marginVertical: 14,
  },
  bubbleAmount: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  bubbleNote: {
    color: '#98989F',
    fontSize: 13,
    marginTop: 4,
  },
  trackedPill: {
    alignSelf: 'flex-start',
    marginTop: 14,
    borderRadius: 6,
    borderCurve: 'continuous',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  trackedPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  cardStack: {
    width: 252,
    height: 172,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletBankCard: {
    position: 'absolute',
    width: 216,
    height: 138,
    borderRadius: 18,
    borderCurve: 'continuous',
    padding: 16,
    justifyContent: 'space-between',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  cardSheen: {
    position: 'absolute',
    top: -46,
    right: -34,
    width: 132,
    height: 132,
    borderRadius: 66,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
  },
  cbeCard: {
    backgroundColor: '#5B2E91',
  },
  abyssiniaCard: {
    backgroundColor: '#0E8446',
  },
  telebirrCard: {
    backgroundColor: '#00B35E',
  },
  walletCardBackLeft: {
    left: 2,
    top: 12,
    zIndex: 1,
    transform: [{ rotate: '-8deg' }],
    shadowOpacity: 0.4,
    shadowRadius: 14,
  },
  walletCardBackRight: {
    right: 2,
    top: 12,
    zIndex: 2,
    transform: [{ rotate: '8deg' }],
    shadowOpacity: 0.4,
    shadowRadius: 14,
  },
  walletCardFront: {
    zIndex: 3,
  },
  cardFrontTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cardFrontBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cbeName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  abyssiniaName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  telebirrName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginLeft: 8,
  },
  telebirrMarkBox: {
    width: 30,
    height: 30,
    borderRadius: 9,
    borderCurve: 'continuous',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  telebirrMarkText: {
    color: '#00B35E',
    fontSize: 18,
    fontWeight: '900',
    marginTop: -1,
  },
  telebirrLabel: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 11,
  },
  telebirrBalance: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginTop: 1,
  },
  bankCardSub: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 8.5,
    fontWeight: '600',
    letterSpacing: 0.8,
    marginTop: 2,
  },
  bankCardNumber: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 2,
  },
  bankCardFooterTag: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  cardChip: {
    width: 34,
    height: 24,
    borderRadius: 5,
    backgroundColor: '#D8DCE3',
    paddingHorizontal: 5,
    justifyContent: 'center',
    gap: 3,
  },
  cardChipLine: {
    height: 1.5,
    borderRadius: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  shieldWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  onDevicePill: {
    marginTop: 10,
    borderRadius: 6,
    borderCurve: 'continuous',
    paddingHorizontal: 9,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  onDevicePillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  footer: {
    marginTop: 'auto',
    gap: 20,
    paddingTop: 20,
    paddingBottom: 4,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 8,
  },
  dot: {
    height: 7,
    borderRadius: 4,
  },
  continueButton: {
    minHeight: 54,
    borderRadius: 14,
    borderCurve: 'continuous',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 15,
  },
  continueButtonPressed: {
    opacity: 0.65,
  },
  continueLabel: {
    color: theme.colors.background,
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
});