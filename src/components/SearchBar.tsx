import { useState } from 'react';
import { TextInput, StyleSheet, View, Pressable, LayoutAnimation, Platform, UIManager, Dimensions } from 'react-native';
import { AppText as Text } from './AppText';;
import Svg, { Circle, Path } from 'react-native-svg';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SearchIcon = ({ size = 20, color = "#8AA094" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="11" cy="11" r="8" />
    <Path d="m21 21-4.35-4.35" />
  </Svg>
);

const screenWidth = Dimensions.get('window').width;
const SEARCH_WIDTH = screenWidth - 40; // Full screen minus 20px padding on each side

type SearchBarProps = {
  onSearch: (query: string) => void;
  placeholder?: string;
};

export function SearchBar({ onSearch, placeholder = 'Search transactions...' }: SearchBarProps) {
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
      <Pressable onPress={handlePress} style={styles.iconContainer}>
        <SearchIcon color={isExpanded ? "transparent" : "#8AA094"} />
      </Pressable>
      
      {isExpanded && (
        <View style={styles.expandedContainer}>
          <SearchIcon color="#B8D69F" />
          <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor="#8AA094"
            value={query}
            onChangeText={handleChangeText}
            onBlur={handleBlur}
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <Pressable onPress={() => { setQuery(''); onSearch(''); }} style={styles.clearButton} hitSlop={15}>
              <Text style={styles.clearText}>✕</Text>
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
    zIndex: 100, // Float above neighbors
  },
  iconContainer: {
    backgroundColor: '#1A2A23',
    borderRadius: 999,
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandedContainer: {
    position: 'absolute',
    right: -100, // Offset to perfectly cover Filter and Lock buttons in headerActions
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E2F26', 
    borderRadius: 999,
    paddingHorizontal: 16,
    height: 44,
    width: SEARCH_WIDTH,
    borderWidth: 1,
    borderColor: '#3A4A43',
    // Shadow for the floating effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
  },
  input: {
    flex: 1,
    color: '#F5F7F1',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 12,
    padding: 0,
  },
  clearButton: {
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2D4436',
    borderRadius: 12,
    width: 24,
    height: 24,
  },
  clearText: {
    color: '#8AA094',
    fontSize: 12,
    fontWeight: '800',
  },
});
