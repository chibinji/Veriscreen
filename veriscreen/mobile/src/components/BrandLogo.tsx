import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { APP_NAME } from '../constants';
import { colors } from '../theme';

export function BrandLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const box = size === 'lg' ? 56 : size === 'sm' ? 32 : 40;
  const fontSize = size === 'lg' ? 26 : size === 'sm' ? 18 : 22;

  return (
    <View style={styles.row}>
      <Image
        source={require('../../assets/veriscreen-logo.jpg')}
        style={{ width: box, height: box }}
        resizeMode="contain"
      />
      <Text style={[styles.word, { fontSize }]}>{APP_NAME}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  word: { color: colors.indigo, fontWeight: '800', letterSpacing: -0.4 },
});
