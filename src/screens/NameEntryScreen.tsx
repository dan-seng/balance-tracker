import { t } from '../i18n';
import { useState } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import {
  AppText as Text,
  AppTextInput as TextInput,
} from '../components/AppText';
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
        style={styles.fill}
        behavior={Platform.OS === 'android' ? 'height' : 'padding'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.wrapper}>
            <View style={styles.content}>
              <Text style={styles.badge}>ሒሳብ</Text>
              <Text style={styles.title}>{t('What shall we call you?')}</Text>
              <View style={styles.titleSelector}>
                <Pressable
                  style={[
                    styles.titleOption,
                    title === 'Mr.' && styles.titleOptionActive,
                  ]}
                  onPress={() => setTitle('Mr.')}
                >
                  <Text
                    style={[
                      styles.titleOptionText,
                      title === 'Mr.' && styles.titleOptionTextActive,
                    ]}
                  >
                    {t('Mr.')}
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.titleOption,
                    title === 'Ms.' && styles.titleOptionActive,
                  ]}
                  onPress={() => setTitle('Ms.')}
                >
                  <Text
                    style={[
                      styles.titleOptionText,
                      title === 'Ms.' && styles.titleOptionTextActive,
                    ]}
                  >
                    {t('Ms.')}
                  </Text>
                </Pressable>
              </View>

              <TextInput
                style={styles.input}
                placeholder={t('Your first name')}
                placeholderTextColor="#65776B"
                value={name}
                onChangeText={setName}
                autoFocus
                maxLength={20}
              />
            </View>

            <PrimaryButton
              label={t('Continue')}
              onPress={() => onNameSubmit(name.trim() || t('User'), title)}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  wrapper: {
    flex: 1,
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 32,
    paddingTop: 64,
  },
  content: {
    width: '100%',
  },
  badge: {
    color: '#bbbdbfff',
    fontSize: 38,
    letterSpacing: 1.5,
    marginBottom: 28,
    fontFamily: 'nokiapure',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '600',
    letterSpacing: -0.5,
    lineHeight: 38,
    marginBottom: 16,
  },
  titleSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  titleOption: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#2A5A4A',
    backgroundColor: 'transparent',
  },
  titleOptionActive: {
    backgroundColor: '#2A5A4A',
    borderColor: '#2A5A4A',
  },
  titleOptionText: {
    color: '#9EADAD',
    fontSize: 14,
    fontWeight: '600',
  },
  titleOptionTextActive: {
    color: '#FFFFFF',
  },
  input: {
    width: '100%',
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    borderBottomWidth: 1.5,
    borderBottomColor: '#2A5A4A',
    paddingVertical: 8,
  },
});
