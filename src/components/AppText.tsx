import React from 'react';
import { Text as RNText, TextInput as RNTextInput, TextProps, TextInputProps, StyleSheet } from 'react-native';

import { theme } from '../theme/index';

// System-font rendering: no forced fontFamily, so fontWeight maps to the
// platform's native typeface. Components opt into named fonts (serif,
// nokiapure, ...) by passing an explicit fontFamily.
function resolveFontStyle(style: any) {
  const flatStyle = StyleSheet.flatten(style || {});
  const hasCustomFont = Boolean(flatStyle.fontFamily);

  if (hasCustomFont) {
    return [style];
  }

  return [
    { color: flatStyle.color || theme.colors.text },
    style,
  ];
}

export function AppText(props: TextProps) {
  const { style, allowFontScaling = false, ...rest } = props;
  return <RNText {...rest} allowFontScaling={allowFontScaling} style={resolveFontStyle(style)} />;
}

export function AppTextInput(props: TextInputProps) {
  const { style, allowFontScaling = false, ...rest } = props;
  return <RNTextInput {...rest} allowFontScaling={allowFontScaling} style={resolveFontStyle(style)} />;
}