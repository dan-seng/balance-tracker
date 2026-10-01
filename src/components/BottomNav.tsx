import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Keyboard, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';

import { AppText } from './AppText';

const ACTIVE = '#FFFFFF';
const INACTIVE = 'rgba(235, 235, 245, 0.35)';

const WalletIcon = ({ size = 24, color = INACTIVE }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
    <Path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
    <Path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
  </Svg>
);

const AnalyticsIcon = ({ size = 24, color = INACTIVE }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 3v18h18" />
    <Path d="M18 17V9" />
    <Path d="M13 17V5" />
    <Path d="M8 17v-3" />
  </Svg>
);

const SettingsIcon = ({ size = 24, color = INACTIVE }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <Circle cx="12" cy="12" r="3" />
  </Svg>
);

const AddBankIcon = ({ size = 24, color = INACTIVE }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 5v14" />
    <Path d="M5 12h14" />
  </Svg>
);

const ShopIcon = ({ size = 24, color = INACTIVE }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 10l2-6h14l2 6M4 10v10h16V10M3 10c0 3 4 3 4 0 0 3 5 3 5 0 0 3 5 3 5 0 0 3 4 3 4 0M9 20v-6h6v6" />
  </Svg>
);

export type TabType = 'dashboard' | 'analytics' | 'shop' | 'settings' | 'addBank';

type BottomNavProps = {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
};

const TABS: { key: TabType; label: string; icon: (p: { size?: number; color?: string }) => React.ReactNode }[] = [
  { key: 'dashboard', label: 'Wallet', icon: WalletIcon },
  { key: 'analytics', label: 'Analytics', icon: AnalyticsIcon },
  { key: 'shop', label: 'Shop', icon: ShopIcon },
  { key: 'addBank', label: 'Add Bank', icon: AddBankIcon },
  { key: 'settings', label: 'Settings', icon: SettingsIcon },
];

export function BottomNav({ currentTab, onTabChange }: BottomNavProps) {
  const insets = useSafeAreaInsets();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  if (isKeyboardVisible) return null;

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 6) }]}>
      {TABS.map(({ key, label, icon: Icon }) => {
        const active = currentTab === key;
        const color = active ? ACTIVE : INACTIVE;

        return (
          <Pressable
            key={key}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={label}
            onPress={() => onTabChange(key)}
            style={({ pressed }) => [styles.tab, pressed && styles.tabPressed]}>
            <Icon size={23} color={color} />
            <AppText style={[styles.label, active && styles.labelActive]}>
              {label}
            </AppText>
            <View style={styles.indicator}>
              <View style={[styles.dot, active && styles.dotActive]} />
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: 'rgba(22, 22, 24, 0.92)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(84, 84, 88, 0.55)',
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 2,
  },
  tabPressed: {
    opacity: 0.6,
  },
  label: {
    color: 'rgba(235, 235, 245, 0.35)',
    fontSize: 10,
    fontWeight: '500',
  },
  labelActive: {
    color: '#FFFFFF',
  },
  indicator: {
    height: 3,
  },
  dot: {
    borderRadius: 2,
    height: 3,
    width: 3,
    backgroundColor: 'transparent',
  },
  dotActive: {
    backgroundColor: '#FFFFFF',
  },
});
