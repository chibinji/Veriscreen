import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

export function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number | string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={18} color={colors.indigo} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#eef1fb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  value: { fontSize: 24, fontWeight: '800', color: colors.navy },
  title: { marginTop: 2, fontSize: 12, color: colors.muted, fontWeight: '600' },
});
