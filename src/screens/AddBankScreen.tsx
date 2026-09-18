import { useState } from 'react';
import { StyleSheet, View, Pressable, Alert } from 'react-native';
import { AppText as Text, AppTextInput as TextInput } from '../components/AppText';
import { Screen } from '../components/Screen';

const BLUE = '#0A84FF';
const LABEL2 = 'rgba(235, 235, 245, 0.60)';
const LABEL3 = 'rgba(235, 235, 245, 0.30)';
const GROUPED1 = '#1C1C1E';
const SEPARATOR = 'rgba(84, 84, 88, 0.55)';

type AddBankScreenProps = {
  onAddBank: (bankName: string, senderId: string, logoBase64: string | null) => Promise<void>;
  onCancel: () => void;
};

export function AddBankScreen({ onAddBank, onCancel }: AddBankScreenProps) {
  const [bankName, setBankName] = useState('');
  const [senderId, setSenderId] = useState('');

  const handleAdd = async () => {
    if (!bankName.trim()) {
      Alert.alert('Error', 'Please enter a bank name');
      return;
    }
    if (!senderId.trim()) {
      Alert.alert('Error', 'Please enter a sender ID');
      return;
    }

    await onAddBank(bankName.trim(), senderId.trim(), null);
  };

  return (
    <Screen scrollable>
      <View style={styles.container}>
        <Text style={styles.title}>Add Bank</Text>
        <Text style={styles.subtitle}>Track transactions from SMS messages</Text>

        <View style={styles.group}>
          <View style={styles.groupHeader}>
            <Text style={styles.fieldLabel}>Bank Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Abyssinia Bank"
              placeholderTextColor={LABEL3}
              value={bankName}
              onChangeText={setBankName}
            />
          </View>
          <View style={styles.groupDivider}>
            <Text style={styles.fieldLabel}>Sender ID</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 127, CBE, BOA"
              placeholderTextColor={LABEL3}
              value={senderId}
              onChangeText={setSenderId}
              autoCapitalize="characters"
            />
          </View>
        </View>

        <View style={styles.buttons}>
          <Pressable onPress={onCancel} hitSlop={10}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.primaryButtonPressed,
            ]}
            onPress={handleAdd}>
            <Text style={styles.primaryButtonText}>Add Bank</Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 24,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  subtitle: {
    color: LABEL2,
    fontSize: 13,
    marginBottom: 26,
    marginTop: 4,
  },
  group: {
    backgroundColor: GROUPED1,
    borderRadius: 16,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  groupHeader: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  groupDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: SEPARATOR,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  fieldLabel: {
    color: LABEL2,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#000000',
    borderRadius: 10,
    color: '#FFFFFF',
    fontSize: 15,
    paddingHorizontal: 13,
    paddingVertical: 11,
  },
  buttons: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 18,
    justifyContent: 'space-between',
    marginTop: 28,
  },
  cancelText: {
    color: BLUE,
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: BLUE,
    borderRadius: 999,
    minWidth: 140,
    paddingVertical: 14,
  },
  primaryButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});