import React from 'react';
import { Image, StyleSheet } from 'react-native';

export function Brand({ light = false, compact = false }: { light?: boolean; compact?: boolean }) {
  return (
    <Image
      source={light ? require('../../../assets/images/north-logo-light.png') : require('../../../assets/images/north-logo-dark.png')}
      style={[styles.logo, compact ? styles.compact : styles.regular, !light && styles.darkVariant]}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  logo: { aspectRatio: 4, alignSelf: 'center' },
  regular: { width: 172, height: 43 },
  compact: { width: 125, height: 31 },
  darkVariant: { opacity: 1 },
});
