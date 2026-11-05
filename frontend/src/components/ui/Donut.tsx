import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '@/theme';

export function Donut({ percent, size = 122 }: { percent: number; size?: number }) {
  const stroke = 10;
  const pct = Math.max(0, Math.min(100, percent));
  const segments = 120;
  const active = Math.round((pct / 100) * segments);
  const radius = (size - stroke) / 2;
  const segmentWidth = Math.max(2, (2 * Math.PI * radius) / segments + 0.4);
  const center = size / 2;
  return <View style={{ width: size, height: size }}>
    {Array.from({ length: segments }, (_, i) => {
      const angle = (i / segments) * 360 - 90;
      const rad = (angle * Math.PI) / 180;
      const left = center + Math.cos(rad) * radius - segmentWidth / 2;
      const top = center + Math.sin(rad) * radius - stroke / 2;
      return <View key={i} style={[styles.segment, { width: segmentWidth, height: stroke, left, top, backgroundColor: i < active ? colors.blue : '#D7DEE8', transform: [{ rotate: `${angle + 90}deg` }] }]} />;
    })}
    <View style={[styles.center, { left: stroke + 1, top: stroke + 1, width: size - (stroke + 1) * 2, height: size - (stroke + 1) * 2, borderRadius: size / 2 }]} pointerEvents="none">
      <Text style={styles.percent}>{Math.round(pct)}%</Text><Text style={styles.caption}>da meta</Text>
    </View>
  </View>;
}

const styles = StyleSheet.create({ track: { position: 'absolute', borderColor: '#D7DEE8' }, segment: { position: 'absolute', borderRadius: 8 }, center: { position: 'absolute', backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' }, percent: { ...typography.h2, color: colors.blue, fontSize: 21, lineHeight: 26, fontWeight: '700', zIndex: 10 }, caption: { ...typography.caption, color: colors.gray500, marginTop: -1, zIndex: 10 } });
