import { useState } from 'react';
import { StyleSheet, View, Pressable, Alert, Modal } from 'react-native';
import { AppText as Text, AppTextInput as TextInput } from '../components/AppText';
import { Screen } from '../components/Screen';
import Svg, { Path, Circle } from 'react-native-svg';

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

type SettingsScreenProps = {
  userName: string;
  onNameChange: (name: string) => Promise<void>;
  isAppLocked: boolean;
  onToggleLock: () => Promise<void>;
  autoLockTimeout: number;
  onAutoLockTimeoutChange: (minutes: number) => void;
};

export function SettingsScreen({
  userName,
  onNameChange,
  isAppLocked,
  onToggleLock,
  autoLockTimeout,
  onAutoLockTimeoutChange,
}: SettingsScreenProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(userName);
  const [showTimeoutDropdown, setShowTimeoutDropdown] = useState(false);

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
            <View style={[styles.toggle, isAppLocked && styles.toggleOn]} />
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
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    paddingBottom: 80, // Add bottom padding to prevent items hiding under bottom nav
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#8A8A8A',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  settingItem: {
    backgroundColor: '#181818',
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    backgroundColor: '#000000',
    borderRadius: 12,
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  settingDescription: {
    color: '#8A8A8A',
    fontSize: 14,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#333333',
  },
  toggleOn: {
    backgroundColor: '#FFFFFF',
  },
  dropdownContainer: {
    backgroundColor: '#000000',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  dropdownValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  dropdownArrow: {
    color: '#8A8A8A',
    fontSize: 12,
  },
  dropdownMenu: {
    backgroundColor: '#181818',
    borderRadius: 12,
    marginTop: 8,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  dropdownItemActive: {
    backgroundColor: '#333333',
  },
  dropdownItemText: {
    color: '#8A8A8A',
    fontSize: 14,
    fontWeight: '600',
  },
  dropdownItemTextActive: {
    color: '#FFFFFF',
  },
  nameInput: {
    color: '#FFFFFF',
    fontSize: 14,
    backgroundColor: '#000000',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#333333',
  },
  editButton: {
    backgroundColor: '#222222',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#444444',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#181818',
    borderRadius: 24,
    width: '100%',
    maxWidth: 340,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 20,
    textAlign: 'center',
  },
  checkIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
