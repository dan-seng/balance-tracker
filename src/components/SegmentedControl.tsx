import { t } from '../i18n';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from './AppText';

type SegmentedControlProps = {
  options: string[];
  value: number;
  onChange: (index: number) => void;
  accessibilityLabel?: string;
};

export function SegmentedControl({
  options,
  value,
  onChange,
  accessibilityLabel,
}: SegmentedControlProps) {
  return (
    <View style={styles.wrapper}>
      {options.map((option, index) => {
        const active = index === value;

        return (
          <Pressable
            key={option}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`${accessibilityLabel ?? ''} ${t(option)}`}
            onPress={() => onChange(index)}
            style={[styles.item, active && styles.itemActive]}
          >
            <AppText style={[styles.label, active && styles.labelActive]}>
              {t(option)}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#000000',
    borderColor: 'rgba(84, 84, 88, 0.30)',
    borderRadius: 9,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 2,
  },
  item: {
    alignItems: 'center',
    borderRadius: 7,
    flex: 1,
    paddingVertical: 6,
  },
  itemActive: {
    backgroundColor: '#2C2C2E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 1,
    elevation: 1,
  },
  label: {
    color: 'rgba(235, 235, 245, 0.60)',
    fontSize: 13,
    fontWeight: '500',
  },
  labelActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});