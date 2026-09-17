import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';

const WalletIcon = ({ size = 24, color = "#8AA094" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
    <Path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
    <Path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
  </Svg>
);

const AnalyticsIcon = ({ size = 24, color = "#8AA094" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 3v18h18" />
    <Path d="M18 17V9" />
    <Path d="M13 17V5" />
    <Path d="M8 17v-3" />
  </Svg>
);

const SettingsIcon = ({ size = 24, color = "#8AA094" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <Circle cx="12" cy="12" r="3" />
  </Svg>
);

const AddBankIcon = ({ size = 24, color = "#8AA094" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 5v14" />
    <Path d="M5 12h14" />
  </Svg>
);

export type TabType = 'dashboard' | 'analytics' | 'settings' | 'addBank';

type BottomNavProps = {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
};

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
    <View style={[styles.container, { bottom: Math.max(insets.bottom, 24) }]}>
      <Pressable
        style={[styles.tab, currentTab === 'dashboard' && styles.activeTab]}
        onPress={() => onTabChange('dashboard')}
      >
        <WalletIcon color={currentTab === 'dashboard' ? '#000000' : '#888888'} />
      </Pressable>
      <Pressable
        style={[styles.tab, currentTab === 'analytics' && styles.activeTab]}
        onPress={() => onTabChange('analytics')}
      >
        <AnalyticsIcon color={currentTab === 'analytics' ? '#000000' : '#888888'} />
      </Pressable>
      <Pressable
        style={[styles.tab, currentTab === 'addBank' && styles.activeTab]}
        onPress={() => onTabChange('addBank')}
      >
        <AddBankIcon color={currentTab === 'addBank' ? '#000000' : '#888888'} />
      </Pressable>
      <Pressable
        style={[styles.tab, currentTab === 'settings' && styles.activeTab]}
        onPress={() => onTabChange('settings')}
      >
        <SettingsIcon color={currentTab === 'settings' ? '#000000' : '#888888'} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    backgroundColor: '#000000',
    borderRadius: 999,
    padding: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 999,
  },
  activeTab: {
    backgroundColor: '#ffffff',
  },
  label: {
    color: '#8A9A92',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  activeLabel: {
    color: '#142018',
  },
});
