import { useState } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { AppText as Text, AppTextInput as TextInput } from '../components/AppText';;
import { ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';

type NameEntryScreenProps = {
  onNameSubmit: (name: string, title: string) => void;
};

export function NameEntryScreen({ onNameSubmit }: NameEntryScreenProps) {
  const [name, setName] = useState('');
  const [title, setTitle] = useState('Mr.');

  return (
    <Screen>
     <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'android' ? 'height' : 'padding'}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
      <View style={styles.wrapper}>
        <View style={styles.content}>
          <Text style={styles.badge}>ሒሳብ</Text>
          <Text style={styles.title}>What shall we call you?</Text>
          <View style={styles.titleSelector}>
            <Pressable
              style={[styles.titleOption, title === 'Mr.' && styles.titleOptionActive]}
              onPress={() => setTitle('Mr.')}
            >
              <Text style={[styles.titleOptionText, title === 'Mr.' && styles.titleOptionTextActive]}>Mr.</Text>
            </Pressable>
            <Pressable
              style={[styles.titleOption, title === 'Ms.' && styles.titleOptionActive]}
              onPress={() => setTitle('Ms.')}
            >
              <Text style={[styles.titleOptionText, title === 'Ms.' && styles.titleOptionTextActive]}>Ms.</Text>
            </Pressable>
          </View>
          
          <TextInput
            style={styles.input}
            placeholder="Your first name"
            placeholderTextColor="#65776B"
            value={name}
            onChangeText={setName}
            autoFocus
            maxLength={20}
          />
        </View>

        <PrimaryButton
          label="Continue"
          onPress={() => onNameSubmit(name.trim() || 'User', title)}
        />
      </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 24,
    paddingTop: 80,
  },
  content: {
    paddingHorizontal: 8,
  },
  badge: {
    color: '#bbbdbfff',
    fontSize: 52,
    letterSpacing: 2,
    marginBottom: 32,
    fontFamily: 'nokiapure'
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 20,
  },
  titleSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  titleOption: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2A5A4A',
    backgroundColor: 'transparent',
  },
  titleOptionActive: {
    backgroundColor: '#2A5A4A',
    borderColor: '#2A5A4A',
  },
  titleOptionText: {
    color: '#9EADAD',
    fontSize: 16,
    fontWeight: '600',
  },
  titleOptionTextActive: {
    color: '#FFFFFF',
  },
  input: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '600',
    borderBottomWidth: 2,
    borderBottomColor: '#2A5A4A',
    paddingVertical: 12,
  }
});
