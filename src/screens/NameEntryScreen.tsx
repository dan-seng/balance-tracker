import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText as Text, AppTextInput as TextInput } from '../components/AppText';;

import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';

type NameEntryScreenProps = {
  onNameSubmit: (name: string) => void;
};

export function NameEntryScreen({ onNameSubmit }: NameEntryScreenProps) {
  const [name, setName] = useState('');

  return (
    <Screen>
      <View style={styles.wrapper}>
        <View style={styles.content}>
          <Text style={styles.badge}>ሒሳብ</Text>
          <Text style={styles.title}>What shall we{'\n'}call you?</Text>
          <Text style={styles.subtitle}>
            Enter your preferred name to personalize your wallet experience.
          </Text>
          
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
          onPress={() => onNameSubmit(name.trim() || 'User')} 
        />
      </View>
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
    fontSize: 42,
    fontWeight: '600',
    letterSpacing: -1,
    lineHeight: 48,
    marginBottom: 20,
  },
  subtitle: {
    color: '#9EADAD',
    fontSize: 16,
    lineHeight: 26,
    fontWeight: '400',
    maxWidth: '90%',
    marginBottom: 40,
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
