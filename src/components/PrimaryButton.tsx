import { Pressable, StyleSheet, Text } from 'react-native';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
};

export function PrimaryButton({ label, onPress }: PrimaryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed ? styles.buttonPressed : null,
      ]}>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: '#D7FF74',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 18,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{scale: 0.97}],
  },
  label: {
    color: '#142018',
    fontSize: 15,
    fontWeight: '700',
  },
});
