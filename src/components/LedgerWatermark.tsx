import { StyleSheet, View } from 'react-native';

const RULE_COUNT = 9;

export function LedgerWatermark() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={styles.rules}>
        {Array.from({ length: RULE_COUNT }).map((_, index) => (
          <View key={index} style={styles.rule} />
        ))}
      </View>
      <View style={[styles.margin, styles.marginOuter]} />
      <View style={[styles.margin, styles.marginInner]} />
    </View>
  );
}

const styles = StyleSheet.create({
  rules: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingRight: 16,
  },
  rule: {
    height: 1,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
  },
  margin: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(212, 175, 55, 0.18)',
  },
  marginOuter: {
    left: 34,
  },
  marginInner: {
    left: 39,
  },
});
