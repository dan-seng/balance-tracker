import { t } from '../i18n';
import { useState } from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  LayoutAnimation,
  Platform,
  UIManager,
  Dimensions,
} from 'react-native';
import { AppTextInput } from './AppText';
import Svg, { Circle, Path } from 'react-native-svg';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SearchIcon = ({ size = 18, color = "#FFFFFF" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="11" cy="11" r="8" />
    <Path d="m21 21-4.35-4.35" />
  </Svg>
);

const screenWidth = Dimensions.get('window').width;
const SEARCH_WIDTH = screenWidth - 40;

type SearchBarProps = {
  onSearch: (query: string) => void;
  placeholder?: string;
};

export function SearchBar({
  onSearch,
  placeholder = t('Bank, account, balance'),
}: SearchBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState('');

  const handlePress = () => {
    if (!isExpanded) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setIsExpanded(true);
    }
  };

  const handleBlur = () => {
    if (query === '') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setIsExpanded(false);
    }
  };

  const handleChangeText = (text: string) => {
    setQuery(text);
    onSearch(text);
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPress={handlePress}
        style={styles.iconContainer}
        accessibilityRole="button"
        accessibilityLabel={t('Search accounts')}
      >
        <SearchIcon color={isExpanded ? 'transparent' : '#FFFFFF'} />
      </Pressable>

      {isExpanded && (
        <View style={styles.expandedContainer}>
          <SearchIcon color="rgba(235,235,245,0.60)" size={16} />
          <AppTextInput
            style={styles.input}
            placeholder={t(placeholder)}
            placeholderTextColor="rgba(235, 235, 245, 0.30)"
            value={query}
            onChangeText={handleChangeText}
            onBlur={handleBlur}
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <Pressable onPress={() => { setQuery(''); onSearch(''); }} style={styles.clearButton} hitSlop={15}>
              <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="rgba(235,235,245,0.60)" strokeWidth="3" strokeLinecap="round">
                <Path d="M18 6 6 18M6 6l12 12" />
              </Svg>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    zIndex: 100,
  },
  iconContainer: {
    backgroundColor: '#1C1C1E',
    borderRadius: 999,
    height: 36,
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandedContainer: {
    position: 'absolute',
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    width: SEARCH_WIDTH,
    borderWidth: 1,
    borderColor: '#3A3A3C',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 10,
    padding: 0,
  },
  clearButton: {
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    width: 24,
    height: 24,
  },
});