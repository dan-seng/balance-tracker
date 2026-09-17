import { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Pressable, Modal, Dimensions, Animated } from 'react-native';
import { AppText as Text, AppTextInput as TextInput } from '../components/AppText';
import { Screen } from '../components/Screen';
import Svg, { Path, Circle } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const LockIcon = ({ size = 20, color = "#8A8A8A" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </Svg>
);

const UnlockIcon = ({ size = 20, color = "#8A8A8A" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <Path d="M9 12h6" />
  </Svg>
);

const UserIcon = ({ size = 20, color = "#8A8A8A" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <Circle cx="12" cy="7" r="4" />
  </Svg>
);

const ClockIcon = ({ size = 20, color = "#8A8A8A" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="10" />
    <Path d="M12 6v6l4 2" />
  </Svg>
);

const InfoIcon = ({ size = 20, color = "#8A8A8A" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="10" />
    <Path d="M12 16v-4" />
    <Path d="M12 8h.01" />
  </Svg>
);

const TrashIcon = ({ size = 16, color = "#8A8A8A" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 6h18" />
    <Path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <Path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </Svg>
);

type SettingsScreenProps = {
  userName: string;
  onNameChange: (name: string) => Promise<void>;
  isAppLocked: boolean;
  onToggleLock: () => Promise<void>;
  autoLockTimeout: number;
  onAutoLockTimeoutChange: (minutes: number) => void;
  customBanks: Array<{ bankId: string; bankName: string; senderId: string; logoBase64: string | null }>;
  onAddCustomBank: (bankName: string, senderId: string, logoBase64: string | null) => Promise<void>;
  onDeleteCustomBank: (bankId: string) => Promise<void>;
};

export function SettingsScreen({
  userName,
  onNameChange,
  isAppLocked,
  onToggleLock,
  autoLockTimeout,
  onAutoLockTimeoutChange,
  customBanks,
  onAddCustomBank: _onAddCustomBank,
  onDeleteCustomBank,
}: SettingsScreenProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(userName);
  const [showTimeoutDropdown, setShowTimeoutDropdown] = useState(false);
  const toggleAnim = useRef(new Animated.Value(isAppLocked ? 1 : 0)).current;

  // Animate toggle when lock state changes
  useEffect(() => {
    Animated.timing(toggleAnim, {
      toValue: isAppLocked ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isAppLocked, toggleAnim]);

  const handleNameSave = async () => {
    if (newName.trim()) {
      await onNameChange(newName.trim());
      setIsEditingName(false);
    }
  };

  const timeoutOptions = [
    { label: 'Immediately', value: 0 },
    { label: '1 minute', value: 1 },
    { label: '5 minutes', value: 5 },
    { label: '15 minutes', value: 15 },
    { label: '30 minutes', value: 30 },
    { label: 'Never', value: -1 },
  ];

  return (
    <Screen scrollable>
      <View style={styles.container}>
        <Text style={styles.title}>Settings</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <UserIcon />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Your Name</Text>
                {isEditingName ? (
                  <TextInput
                    style={styles.nameInput}
                    value={newName}
                    onChangeText={setNewName}
                    onSubmitEditing={handleNameSave}
                    autoFocus
                    autoCapitalize="words"
                  />
                ) : (
                  <Text style={styles.settingDescription}>{userName}</Text>
                )}
              </View>
            </View>
            <Pressable
              style={styles.editButton}
              onPress={() => {
                if (isEditingName) {
                  handleNameSave();
                } else {
                  setIsEditingName(true);
                  setNewName(userName);
                }
              }}
            >
              <Text style={styles.editButtonText}>{isEditingName ? 'Save' : 'Edit'}</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>

          <Pressable style={styles.settingItem} onPress={onToggleLock}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                {isAppLocked ? <LockIcon /> : <UnlockIcon />}
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>App Lock</Text>
                <Text style={styles.settingDescription}>
                  {isAppLocked ? 'Enabled - requires biometric to unlock' : 'Disabled'}
                </Text>
              </View>
            </View>
            <View style={[styles.toggle, isAppLocked && styles.toggleOn]}>
              <Animated.View 
                style={[
                  styles.toggleKnob,
                  {
                    transform: [
                      {
                        translateX: toggleAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, width * 0.05],
                        })
                      }
                    ]
                  }
                ]} 
              />
            </View>
          </Pressable>

          <Pressable 
            style={styles.settingItem} 
            onPress={() => setShowTimeoutDropdown(true)}
          >
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <ClockIcon />
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Auto-lock timeout</Text>
                <Text style={styles.settingDescription}>
                  Lock app after period of inactivity
                </Text>
              </View>
            </View>
            <View style={styles.dropdownContainer}>
              <Text style={styles.dropdownValue}>
                {autoLockTimeout === -1 ? 'Never' : autoLockTimeout === 0 ? 'Immediately' : `${autoLockTimeout} min`}
              </Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </View>
          </Pressable>

          <Modal
            visible={showTimeoutDropdown}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowTimeoutDropdown(false)}
          >
            <Pressable 
              style={styles.modalOverlay} 
              onPress={() => setShowTimeoutDropdown(false)}
            >
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Timeout</Text>
                {timeoutOptions.map((option) => (
                  <Pressable
                    key={option.value}
                    style={[
                      styles.dropdownItem,
                      autoLockTimeout === option.value && styles.dropdownItemActive,
                    ]}
                    onPress={() => {
                      onAutoLockTimeoutChange(option.value);
                      setShowTimeoutDropdown(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        autoLockTimeout === option.value && styles.dropdownItemTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                    {autoLockTimeout === option.value && (
                      <Text style={styles.checkIcon}>✓</Text>
                    )}
                  </Pressable>
                ))}
              </View>
            </Pressable>
          </Modal>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Custom Banks</Text>

          {customBanks.map((bank) => (
            <View key={bank.bankId} style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.iconContainer}>
                  <InfoIcon />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>{bank.bankName}</Text>
                  <Text style={styles.settingDescription}>Sender: {bank.senderId}</Text>
                </View>
              </View>
              <Pressable
                style={styles.deleteButton}
                onPress={() => onDeleteCustomBank(bank.bankId)}
                hitSlop={10}
              >
                <TrashIcon />
              </Pressable>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Version 1.0</Text>
          <Text style={styles.footerText}>Developed by SPDY</Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: width * 0.025,
    paddingBottom: height * 0.1,
    flex: 1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: width * 0.08,
    fontWeight: '800',
    marginBottom: width * 0.08,
  },
  section: {
    marginBottom: width * 0.08,
  },
  sectionTitle: {
    color: '#8A8A8A',
    fontSize: width * 0.03,
    fontWeight: '700',
    marginBottom: width * 0.04,
    textTransform: 'uppercase',
  },
  settingItem: {
    backgroundColor: '#181818',
    borderRadius: width * 0.04,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: width * 0.04,
    marginBottom: width * 0.03,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    backgroundColor: '#000000',
    borderRadius: width * 0.03,
    height: width * 0.1,
    width: width * 0.1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: width * 0.03,
    borderWidth: 1,
    borderColor: '#333333',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    color: '#FFFFFF',
    fontSize: width * 0.04,
    fontWeight: '700',
    marginBottom: width * 0.01,
  },
  settingDescription: {
    color: '#8A8A8A',
    fontSize: width * 0.035,
  },
  toggle: {
    width: width * 0.12,
    height: width * 0.07,
    borderRadius: width * 0.035,
    backgroundColor: '#333333',
    padding: width * 0.008,
  },
  toggleOn: {
    backgroundColor: '#4ade80',
  },
  toggleKnob: {
    width: width * 0.054,
    height: width * 0.054,
    borderRadius: width * 0.027,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  dropdownContainer: {
    backgroundColor: '#000000',
    borderRadius: width * 0.02,
    paddingHorizontal: width * 0.03,
    paddingVertical: width * 0.02,
    flexDirection: 'row',
    alignItems: 'center',
    gap: width * 0.02,
    borderWidth: 1,
    borderColor: '#333333',
  },
  dropdownValue: {
    color: '#FFFFFF',
    fontSize: width * 0.035,
    fontWeight: '700',
  },
  dropdownArrow: {
    color: '#8A8A8A',
    fontSize: width * 0.03,
  },
  dropdownMenu: {
    backgroundColor: '#181818',
    borderRadius: width * 0.03,
    marginTop: width * 0.02,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: width * 0.02,
    paddingVertical: width * 0.02,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownItemActive: {
    backgroundColor: '#333333',
  },
  dropdownItemText: {
    color: '#8A8A8A',
    fontSize: width * 0.028,
    fontWeight: '600',
  },
  dropdownItemTextActive: {
    color: '#FFFFFF',
  },
  nameInput: {
    color: '#FFFFFF',
    fontSize: width * 0.035,
    backgroundColor: '#000000',
    borderRadius: width * 0.02,
    paddingHorizontal: width * 0.03,
    paddingVertical: width * 0.02,
    marginTop: width * 0.01,
    borderWidth: 1,
    borderColor: '#333333',
  },
  editButton: {
    backgroundColor: '#222222',
    borderRadius: width * 0.02,
    paddingHorizontal: width * 0.04,
    paddingVertical: width * 0.02,
    borderWidth: 1,
    borderColor: '#444444',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: width * 0.035,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: width * 0.05,
  },
  modalContent: {
    backgroundColor: '#181818',
    borderRadius: width * 0.04,
    width: '100%',
    maxWidth: width * 0.65,
    padding: width * 0.02,
    borderWidth: 1,
    borderColor: '#333333',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: width * 0.03,
    fontWeight: '800',
    marginBottom: width * 0.02,
    textAlign: 'center',
  },
  checkIcon: {
    color: '#FFFFFF',
    fontSize: width * 0.03,
    fontWeight: '800',
  },
  deleteButton: {
    padding: 8,
    opacity: 0.6,
  },
  modalInput: {
    backgroundColor: '#000000',
    borderRadius: width * 0.02,
    paddingHorizontal: width * 0.03,
    paddingVertical: width * 0.025,
    marginTop: width * 0.02,
    borderWidth: 1,
    borderColor: '#333333',
    color: '#FFFFFF',
    fontSize: width * 0.035,
  },
  modalButton: {
    backgroundColor: '#222222',
    borderRadius: width * 0.02,
    paddingHorizontal: width * 0.04,
    paddingVertical: width * 0.025,
    marginTop: width * 0.03,
    borderWidth: 1,
    borderColor: '#444444',
  },
  modalButtonPrimary: {
    backgroundColor: '#1A2A23',
    borderColor: '#2A5A4A',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: width * 0.035,
    fontWeight: '700',
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
    gap: width * 0.01,
  },
  footerText: {
    color: '#666666',
    fontSize: width * 0.025,
    fontWeight: '500',
  },
});
