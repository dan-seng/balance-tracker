import { useState } from 'react';
import { StyleSheet, View, Pressable, Modal, Switch, TextInput } from 'react-native';
import { AppText as Text } from '../components/AppText';
import { Screen } from '../components/Screen';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

const GREEN = '#30D158';
const ORANGE = '#FF9F0A';
const PURPLE = '#BF5AF2';
const BLUE = '#0A84FF';
const RED = '#FF453A';
const LABEL2 = 'rgba(235, 235, 245, 0.60)';
const LABEL3 = 'rgba(235, 235, 245, 0.30)';
const SEPARATOR = 'rgba(84, 84, 88, 0.55)';
const GROUPED1 = '#1C1C1E';
const GROUPED2 = '#2C2C2E';

const UserIcon = ({ size = 16, color = "#FFFFFF" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <Circle cx="12" cy="7" r="4" />
  </Svg>
);

const LockIcon = ({ size = 16, color = "#FFFFFF" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </Svg>
);

const TimerIcon = ({ size = 16, color = "#FFFFFF" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 22a8 8 0 0 0 8-8c0-4-3-7.4-7-7.9V4h2V2h-6v2h2v2.1" />
    <Circle cx="12" cy="14" r="5" />
    <Path d="M12 12v2l1.5 1.5" />
  </Svg>
);

const BankIcon = ({ size = 16, color = "#FFFFFF" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 21h18" />
    <Path d="M5 21V7l8-4 8 4v14" />
    <Path d="M17 21v-8.5a1.5 1.5 0 0 0-3 0V21" />
    <Path d="M9 21v-6" />
  </Svg>
);

const TrashIcon = ({ size = 15, color = RED }) => (
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
  accounts: Array<{
    id: string;
    bankId: string;
    bankName: string;
    accountNumber: string;
    currentBalance: number;
    currency: string;
    subId?: number | null;
  }>;
  onRenameAccount: (accountId: string, newBankName: string) => Promise<void>;
  onMergeAccounts: (sourceId: string, targetId: string) => Promise<void>;
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
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);

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

  const timeoutValue =
    autoLockTimeout === -1
      ? 'Never'
      : autoLockTimeout === 0
        ? 'Immediately'
        : `${autoLockTimeout} min`;

  return (
    <Screen scrollable>
      <View style={styles.container}>
        <Text style={styles.title}>Settings</Text>

        <Text style={styles.groupHeader}>Profile</Text>
        <View style={styles.group}>
          <View style={styles.row}>
            <View style={[styles.icon, styles.iconProfile]}>
              <UserIcon />
            </View>
            <View style={styles.rowBody}>
              <Text style={styles.rowLabel}>Your Name</Text>
              {isEditingName ? (
                <TextInput
                  style={styles.nameInput}
                  value={newName}
                  onChangeText={setNewName}
                  onSubmitEditing={handleNameSave}
                  placeholder="Name"
                  placeholderTextColor={LABEL3}
                  autoFocus
                  autoCapitalize="words"
                />
              ) : (
                <Text style={styles.rowDescription} numberOfLines={1}>
                  {userName}
                </Text>
              )}
            </View>
            <Pressable
              hitSlop={10}
              onPress={() => {
                if (isEditingName) {
                  handleNameSave();
                } else {
                  setIsEditingName(true);
                  setNewName(userName);
                }
              }}>
              <Text style={styles.linkText}>{isEditingName ? 'Save' : 'Edit'}</Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.groupHeader}>Security</Text>
        <View style={styles.group}>
          <View style={styles.row}>
            <View style={[styles.icon, { backgroundColor: GREEN }]}>
              <LockIcon />
            </View>
            <View style={styles.rowBody}>
              <Text style={styles.rowLabel}>App Lock</Text>
              <Text style={styles.rowDescription} numberOfLines={1}>
                {isAppLocked
                  ? 'Enabled — requires biometric to open'
                  : 'Disabled'}
              </Text>
            </View>
            <Switch
              value={isAppLocked}
              onValueChange={() => {
                onToggleLock();
              }}
              trackColor={{ true: GREEN, false: GROUPED2 }}
              thumbColor="#FFFFFF"
              ios_backgroundColor={GROUPED2}
            />
          </View>

          <Pressable
            style={styles.row}
            onPress={() => setShowTimeoutModal(true)}>
            <View style={[styles.icon, { backgroundColor: ORANGE }]}>
              <TimerIcon />
            </View>
            <View style={styles.rowBody}>
              <Text style={styles.rowLabel}>Auto-lock timeout</Text>
              <Text style={styles.rowDescription} numberOfLines={1}>
                Lock after inactivity
              </Text>
            </View>
            <Text style={styles.rowValue}>{timeoutValue}</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        </View>

        <Text style={styles.groupHeader}>Custom Banks</Text>
        <View style={styles.group}>
          {customBanks.length === 0 ? (
            <View style={styles.row}>
              <View style={styles.rowBody}>
                <Text style={styles.rowDescription}>
                  No custom banks added yet.
                </Text>
              </View>
            </View>
          ) : (
            customBanks.map((bank, index) => (
              <View
                key={bank.bankId}
                style={[
                  styles.row,
                  index !== customBanks.length - 1 && styles.rowBorder,
                ]}>
                <View style={[styles.icon, { backgroundColor: PURPLE }]}>
                  <BankIcon />
                </View>
                <View style={styles.rowBody}>
                  <Text style={styles.rowLabel} numberOfLines={1}>
                    {bank.bankName}
                  </Text>
                  <Text style={styles.rowDescription} numberOfLines={1}>
                    Sender: {bank.senderId}
                  </Text>
                </View>
                <Pressable
                  hitSlop={12}
                  onPress={() => onDeleteCustomBank(bank.bankId)}
                  accessibilityLabel={`Delete ${bank.bankName}`}>
                  <TrashIcon />
                </Pressable>
              </View>
            ))
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Version 1.0 · Developed by SPDY</Text>
        </View>
      </View>

      <Modal
        visible={showTimeoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTimeoutModal(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowTimeoutModal(false)}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Auto-Lock</Text>
            {timeoutOptions.map((option, index) => {
              const selected = autoLockTimeout === option.value;
              const isLast = index === timeoutOptions.length - 1;

              return (
                <Pressable
                  key={option.value}
                  onPress={() => {
                    onAutoLockTimeoutChange(option.value);
                    setShowTimeoutModal(false);
                  }}
                  style={[
                    styles.modalItem,
                    !isLast && styles.modalItemBorder,
                  ]}>
                  <Text
                    style={[
                      styles.modalItemText,
                      selected && styles.modalItemTextSelected,
                    ]}>
                    {option.label}
                  </Text>
                  {selected && <Text style={styles.modalCheck}>✓</Text>}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 8,
    paddingBottom: 60,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
    marginBottom: 30,
  },
  groupHeader: {
    color: LABEL2,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 6,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  group: {
    backgroundColor: GROUPED1,
    borderRadius: 16,
    borderCurve: 'continuous',
    marginBottom: 28,
    overflow: 'hidden',
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    minHeight: 46,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: SEPARATOR,
  },
  icon: {
    alignItems: 'center',
    borderRadius: 8,
    height: 29,
    justifyContent: 'center',
    width: 29,
  },
  iconProfile: {
    backgroundColor: '#58636E',
  },
  rowBody: {
    flex: 1,
  },
  rowLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
  rowDescription: {
    color: LABEL3,
    fontSize: 12,
    marginTop: 2,
  },
  rowValue: {
    color: LABEL2,
    fontSize: 15,
    fontVariant: ['tabular-nums'],
  },
  chevron: {
    color: LABEL3,
    fontSize: 20,
    fontWeight: '400',
    marginTop: -2,
  },
  linkText: {
    color: BLUE,
    fontSize: 15,
    fontWeight: '600',
  },
  nameInput: {
    backgroundColor: '#000000',
    borderColor: '#3A3A3C',
    borderRadius: 8,
    borderWidth: 1,
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  footer: {
    alignItems: 'center',
    marginTop: 8,
  },
  footerText: {
    color: LABEL3,
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    flex: 1,
    justifyContent: 'center',
    padding: 40,
  },
  modalCard: {
    backgroundColor: GROUPED1,
    borderRadius: 16,
    borderCurve: 'continuous',
    overflow: 'hidden',
    paddingTop: 8,
    width: '100%',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    textAlign: 'center',
  },
  modalItem: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  modalItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: SEPARATOR,
  },
  modalItemText: {
    color: LABEL2,
    fontSize: 16,
    fontWeight: '400',
  },
  modalItemTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalCheck: {
    color: BLUE,
    fontSize: 16,
    fontWeight: '700',
  },
});