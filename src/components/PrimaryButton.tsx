import { Pressable, StyleSheet, View } from 'react-native';
import { AppText as Text } from './AppText';;


type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
};

export function PrimaryButton({ label, onPress }: PrimaryButtonProps) {
  return (
    <View style={styles.container}>
      {/* Subtle outer glow layer to attract attention */}
      <View style={styles.glow} pointerEvents="none" />
      
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.button,
          pressed ? styles.buttonPressed : null,
        ]}>
        <Text style={styles.label}>{label}   →</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    width: '80%',
  },
  glow: {
    position: 'absolute',
    top: 5,
    bottom: -5,
    left: 20,
    right: 20,
    backgroundColor: '#ffffffff',
    borderRadius: 30,
    opacity: 0.18,
    transform: [{ scaleY: 1.1 }],
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#ffffffff',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 20,
    width: '100%',
  },
  buttonPressed: {
    opacity: 0.7,
  },
  label: {
    color: '#000000ff',
    fontSize: 17,
    fontFamily: 'Poppins-Bold',
    letterSpacing: 0.5,
  },
});
