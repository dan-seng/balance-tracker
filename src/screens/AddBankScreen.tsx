import { useState } from 'react';
import { StyleSheet, View, Pressable, Image, Alert } from 'react-native';
import { AppText as Text, AppTextInput as TextInput } from '../components/AppText';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';

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
    <Screen>
      <View style={styles.container}>
        <Text style={styles.title}>Add Bank</Text>
        <Text style={styles.subtitle}>
          Add a bank to track transactions from SMS messages
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>Bank Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Abyssinia Bank"
            placeholderTextColor="#666666"
            value={bankName}
            onChangeText={setBankName}
          />

          <Text style={styles.label}>Sender ID</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 127, CBE, BOA"
            placeholderTextColor="#666666"
            value={senderId}
            onChangeText={setSenderId}
            autoCapitalize="characters"
          />

          <View style={styles.buttons}>
            <Pressable style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <View style={styles.addButtonContainer}>
              <PrimaryButton label="Add Bank" onPress={handleAdd} />
            </View>
          </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    color: '#9EADAD',
    fontSize: 16,
    marginBottom: 32,
  },
  form: {
    gap: 20,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1A2A23',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#2A5A4A',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  addButtonContainer: {
    flex: 1,
  },
  cancelButton: {
    
    backgroundColor: 'transparent',
    borderRadius: 18,
    paddingHorizontal: 35,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#2A5A4A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
