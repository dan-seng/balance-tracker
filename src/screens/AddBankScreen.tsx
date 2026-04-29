import { useState } from 'react';
import { StyleSheet, View, Pressable, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { AppText as Text, AppTextInput as TextInput } from '../components/AppText';
import { theme } from '../theme';
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
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <Text style={styles.title}>Add Bank</Text>
            <Text style={styles.subtitle}>
              Track transactions from SMS messages
            </Text>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Bank Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Abyssinia Bank"
                  placeholderTextColor={theme.colors.textMutedLight}
                  value={bankName}
                  onChangeText={setBankName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Sender ID</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 127, CBE, BOA"
                  placeholderTextColor={theme.colors.textMutedLight}
                  value={senderId}
                  onChangeText={setSenderId}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            <View style={styles.buttons}>
              <Pressable style={styles.secondaryButton} onPress={onCancel}>
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.primaryButton} onPress={handleAdd}>
                <Text style={styles.primaryButtonText}>Add Bank</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
  },
  title: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.sm,
    marginBottom: theme.spacing.lg,
  },
  form: {
    gap: theme.spacing.md,
  },
  inputGroup: {
    gap: 4,
  },
  label: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.xs + 2,
    fontWeight: '600',
    marginLeft: 4,
  },
  input: {
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    color: theme.colors.text,
    fontSize: theme.typography.sizes.md,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLighter,
  },
  buttons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
    alignItems: 'center',
  },
  primaryButton: {
    flex: 1.5,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.xl,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: theme.colors.background,
    fontSize: theme.typography.sizes.md,
    fontWeight: '700',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: theme.borderRadius.xl,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: theme.colors.surfaceLighter,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.sizes.md,
    fontWeight: '600',
  },
});
