import { useLanguage } from '../i18n';
import React from 'react';
import {
  Text as RNText,
  TextInput as RNTextInput,
  TextProps,
  TextInputProps,
  StyleSheet,
} from 'react-native';

import { theme } from '../theme/index';

// Amharic uses bundled Nokia Pure across text and inputs. English retains
// system rendering and any explicitly selected component font.
function resolveFontStyle(style: any, amharic: boolean) {
  const flatStyle = StyleSheet.flatten(style || {});
  const hasCustomFont = Boolean(flatStyle.fontFamily);

  if (amharic) {
    // Keep Ethiopic glyphs readable without tight tracking or clipped lines.
    const nativeStyle = { ...flatStyle };
    nativeStyle.fontFamily = theme.typography.fonts.amharic;
    return [
      { color: theme.colors.text },
      nativeStyle,
      {
        letterSpacing: 0,
        lineHeight: Math.max(
          flatStyle.lineHeight || 0,
          (flatStyle.fontSize || 14) * 1.5,
        ),
      },
    ];
  }

  if (hasCustomFont) {
    return [style];
  }

  return [{ color: flatStyle.color || theme.colors.text }, style];
}

export function AppText(props: TextProps) {
  const amharic = useLanguage() === 'am';
  const { style, allowFontScaling = false, ...rest } = props;
  return (
    <RNText
      {...rest}
      allowFontScaling={allowFontScaling}
      style={resolveFontStyle(style, amharic)}
    />
  );
}

export function AppTextInput(props: TextInputProps) {
  const amharic = useLanguage() === 'am';
  const { style, allowFontScaling = false, ...rest } = props;
  return (
    <RNTextInput
      {...rest}
      allowFontScaling={allowFontScaling}
      style={resolveFontStyle(style, amharic)}
    />
  );
}
