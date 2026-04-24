import { Pressable, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { AppText as Text } from './AppText';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  colors?: string[];
};

export function PrimaryButton({
  label,
  onPress,
  colors = ['#eae9e9ff', '#7e7d7dff'], // default gradient
}: PrimaryButtonProps) {
  return (
    <View style={styles.container}>
      {/* Multiple shadow layers for 3D depth */}
      <View style={styles.shadowDeep} pointerEvents="none" />
      <View style={styles.shadowMedium} pointerEvents="none" />
      <View style={styles.shadowLight} pointerEvents="none" />
      
      {/* Glow effect */}
      <View style={styles.glow} pointerEvents="none" />

      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.wrapper,
          pressed && styles.pressed,
        ]}
      >
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
          style={styles.button}
        >
        
          <LinearGradient
            colors={['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.15)', 'rgba(255,255,255,0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.innerHighlight}
          />
          <Text style={styles.label}>{label} →</Text>
        </LinearGradient>
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

  shadowDeep: {
    position: 'absolute',
    top: 8,
    left: 25,
    right: 25,
    bottom: -2,
    backgroundColor: '#000000',
    borderRadius: 24,
    opacity: 0.25,
  },

  shadowMedium: {
    position: 'absolute',
    top: 6,
    left: 23,
    right: 23,
    bottom: 0,
    backgroundColor: '#000000',
    borderRadius: 24,
    opacity: 0.15,
  },

  shadowLight: {
    position: 'absolute',
    top: 4,
    left: 21,
    right: 21,
    bottom: 2,
    backgroundColor: '#000000',
    borderRadius: 24,
    opacity: 0.08,
  },

  glow: {
    position: 'absolute',
    top: 3,
    bottom: -3,
    left: 19,
    right: 19,
    backgroundColor: '#7e7d7d',
    borderRadius: 26,
    opacity: 0.3,
  },

  wrapper: {
    width: '100%',
    borderRadius: 24,
  },

  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 20,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },

  innerHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    borderRadius: 24,
  },

  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }, { translateY: 1 }],
  },

  label: {
    color: '#000',
    fontSize: 17,
    fontFamily: 'Poppins-Bold',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(255,255,255,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
    zIndex: 1,
  },
});