import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';

type WelcomeScreenProps = {
  onContinue: () => void;
};

export function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
  return (
    <Screen>
      <View style={styles.wrapper}>
        <View style={styles.hero}>
          <View style={styles.glowOne} />
          <View style={styles.glowTwo} />
          <Text style={styles.badge}>Hisab</Text>
          <Text style={styles.title}>Track bank SMS like a real wallet.</Text>
          <Text style={styles.subtitle}>
            Read incoming bank messages, structure them locally, and turn them
            into a clean financial timeline.
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>What you get</Text>
          <Text style={styles.featureItem}>Offline-first account tracking</Text>
          <Text style={styles.featureItem}>Automatic transaction parsing</Text>
          <Text style={styles.featureItem}>A calmer dashboard for messy SMS</Text>
        </View>

        <PrimaryButton label="Start Building My Wallet" onPress={onContinue} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 18,
    paddingTop: 12,
  },
  hero: {
    backgroundColor: '#14241D',
    borderRadius: 32,
    minHeight: 380,
    overflow: 'hidden',
    padding: 28,
    position: 'relative',
  },
  glowOne: {
    backgroundColor: '#2A5A4A',
    borderRadius: 999,
    height: 250,
    opacity: 0.8,
    position: 'absolute',
    right: -40,
    top: -30,
    width: 250,
  },
  glowTwo: {
    backgroundColor: '#D7FF74',
    borderRadius: 999,
    bottom: -60,
    height: 160,
    opacity: 0.25,
    position: 'absolute',
    right: 40,
    width: 160,
  },
  badge: {
    color: '#D7FF74',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 20,
    textTransform: 'uppercase',
  },
  title: {
    color: '#F8FAF5',
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -1.5,
    lineHeight: 46,
    marginTop: 12,
    maxWidth: 300,
  },
  subtitle: {
    color: '#B8C4BB',
    fontSize: 15,
    lineHeight: 24,
    marginTop: 16,
    maxWidth: 300,
  },
  featureCard: {
    backgroundColor: '#F1F1E7',
    borderRadius: 24,
    gap: 12,
    marginVertical: 20,
    padding: 24,
  },
  featureTitle: {
    color: '#1B2B22',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  featureItem: {
    color: '#355244',
    fontSize: 14,
    lineHeight: 20,
  },
});
