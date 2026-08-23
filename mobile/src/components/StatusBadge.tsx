import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  const tone =
    /APPROVED|PAID|CONFIRMED|ELIGIBLE|GENERATED|ACTIVE|CLEARED|COMPLETED|SAT/.test(status)
      ? 'success'
      : /PENDING|PARTIAL|UNDER_REVIEW/.test(status)
        ? 'warning'
        : /REJECTED|NOT_ELIGIBLE|OUTSTANDING|FAILED|BLOCKED/.test(status)
          ? 'danger'
          : 'muted';

  const background =
    tone === 'success' ? '#e8f6ee' : tone === 'warning' ? '#fff6dc' : tone === 'danger' ? '#fdecec' : '#eef1f5';
  const color =
    tone === 'success' ? colors.success : tone === 'warning' ? colors.warning : tone === 'danger' ? colors.danger : colors.muted;

  return (
    <View style={[styles.badge, { backgroundColor: background }]}>
      <Text style={[styles.text, { color }]}>{label || status.replace(/_/g, ' ')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  text: { fontSize: 11, fontWeight: '700', letterSpacing: 0.2 },
});
