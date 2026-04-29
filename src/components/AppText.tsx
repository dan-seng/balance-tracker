import React from 'react';
import { Text as RNText, TextInput as RNTextInput, TextProps, TextInputProps, StyleSheet } from 'react-native';

import { theme } from '../theme/index';

function resolveFontStyle(style: any) {
  const flatStyle = StyleSheet.flatten(style || {});
  let isBold = false;
  
  if (
    flatStyle.fontWeight === 'bold' || 
    flatStyle.fontWeight === '600' || 
    flatStyle.fontWeight === '700' || 
    flatStyle.fontWeight === '800' || 
    flatStyle.fontWeight === '900' ||
    flatStyle.fontFamily === 'Poppins-Bold'
  ) {
    isBold = true;
  }
  
  const hasCustomFont = 
    flatStyle.fontFamily && 
    flatStyle.fontFamily !== 'Poppins-Regular' && 
    flatStyle.fontFamily !== 'Poppins-Bold';

  const defaultStyle = {
    fontFamily: isBold ? 'Poppins-Bold' : 'Poppins-Regular',
    color: flatStyle.color || theme.colors.text,
    fontWeight: undefined, // Clear weight so Android does not override fontFamily with Roboto
  };

  return hasCustomFont ? [style] : [defaultStyle, style, { fontWeight: undefined }];
}

export function AppText(props: TextProps) {
  const { style, allowFontScaling = false, ...rest } = props;
  return <RNText {...rest} allowFontScaling={allowFontScaling} style={resolveFontStyle(style)} />;
}

export function AppTextInput(props: TextInputProps) {
  const { style, allowFontScaling = false, ...rest } = props;
  return <RNTextInput {...rest} allowFontScaling={allowFontScaling} style={resolveFontStyle(style)} />;
}
