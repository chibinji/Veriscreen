import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { APP_NAME } from '../constants';
import { colors } from '../theme';

export function BrandLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const box = size === 'lg' ? 56 : size === 'sm' ? 32 : 40;
  const fontSize = size === 'lg' ? 26 : size === 'sm' ? 18 : 22;

  return (
    <View style={styles.row}>
      <View style={[styles.mark, { width: box, height: box, borderRadius: box * 0.22 }]}>
        <Text style={[styles.check, { fontSize: box * 0.42 }]}>✓</Text>
      </View>
      <Text style={[styles.word, { fontSize }]}>{APP_NAME}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mark: {
    backgroundColor: colors.indigo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: { color: colors.gold, fontWeight: '800' },
  word: { color: colors.indigo, fontWeight: '800', letterSpacing: -0.4 },
});
