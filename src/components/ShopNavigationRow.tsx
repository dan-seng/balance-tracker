import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { AppText } from './AppText';
import { theme } from '../theme';
export type ShopIcon =
  | 'tools'
  | 'help'
  | 'returns'
  | 'stock'
  | 'daily'
  | 'statements'
  | 'suppliers';
const icons: Record<ShopIcon, { color: string; path: string }> = {
  tools: {
    color: theme.colors.iOS.gold,
    path: 'M4 7h16M4 17h16M8 4v6M16 14v6',
  },
  help: {
    color: theme.colors.iOS.blue,
    path: 'M9 9a3 3 0 1 1 5 2.2c-1 .7-2 1.3-2 2.8M12 17h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  },
  returns: {
    color: theme.colors.iOS.blue,
    path: 'M9 5 4 10l5 5M4 10h10a6 6 0 0 1 0 12',
  },
  stock: {
    color: theme.colors.iOS.orange,
    path: 'm3 7 9-4 9 4-9 4-9-4M3 7v10l9 4 9-4V7M12 11v10',
  },
  daily: {
    color: theme.colors.iOS.green,
    path: 'M7 3h10v3H7zM7 4H4v18h16V4h-3M8 11h8M8 15h8M8 19h5',
  },
  statements: {
    color: theme.colors.iOS.purple,
    path: 'M14 2H5v20h14V7l-5-5M14 2v6h5M8 12h8M8 16h8',
  },
  suppliers: {
    color: theme.colors.iOS.gold,
    path: 'M3 21h18M5 21V9l7-6 7 6v12M9 21v-6h6v6M9 10h.01M15 10h.01',
  },
};
type Props = {
  title: string;
  description?: string;
  icon: ShopIcon;
  onPress: () => void;
  disabled?: boolean;
  expanded?: boolean;
  last?: boolean;
};
export function ShopNavigationRow({
  title,
  description,
  icon,
  onPress,
  disabled = false,
  expanded,
  last = false,
}: Props) {
  const symbol = icons[icon];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={description}
      accessibilityState={{
        disabled,
        ...(expanded !== undefined ? { expanded } : {}),
      }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        !last && styles.separator,
        (pressed || disabled) && styles.dim,
      ]}
    >
      <View
        accessible={false}
        style={[styles.icon, { backgroundColor: `${symbol.color}20` }]}
      >
        <Svg
          width={19}
          height={19}
          viewBox="0 0 24 24"
          fill="none"
          stroke={symbol.color}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <Path d={symbol.path} />
        </Svg>
      </View>
      <View style={styles.body}>
        <AppText allowFontScaling style={styles.title}>
          {title}
        </AppText>
        {description && (
          <AppText allowFontScaling style={styles.description}>
            {description}
          </AppText>
        )}
      </View>
      <AppText accessible={false} style={styles.chevron}>
        {expanded === undefined ? '›' : expanded ? '−' : '+'}
      </AppText>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  separator: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.iosSurface.separator,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, minWidth: 0, gap: 3 },
  title: {
    color: theme.colors.iosSurface.label,
    fontSize: 15,
    fontWeight: '500',
  },
  description: {
    color: theme.colors.iosSurface.label2,
    fontSize: 12,
    lineHeight: 18,
  },
  chevron: { color: theme.colors.iosSurface.label2, fontSize: 22 },
  dim: { opacity: 0.55 },
});
