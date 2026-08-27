import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, radii } from '../theme';

export function ErrorBanner({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <View style={styles.error}>
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
}

export function LoadingBlock({ text = 'Loading…' }: { text?: string }) {
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={colors.indigo} />
      <Text style={styles.loadingText}>{text}</Text>
    </View>
  );
}

export function EmptyState({ title, detail }: { title: string; detail?: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>{title}</Text>
      {detail ? <Text style={styles.emptyDetail}>{detail}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  error: {
    backgroundColor: '#fdecec',
    borderRadius: radii.control,
    padding: 12,
    marginBottom: 12,
  },
  errorText: { color: colors.danger, fontWeight: '600' },
  loading: { alignItems: 'center', paddingVertical: 28, gap: 10 },
  loadingText: { color: colors.muted },
  empty: { alignItems: 'center', paddingVertical: 28 },
  emptyTitle: { color: colors.navy, fontWeight: '700' },
  emptyDetail: { color: colors.muted, marginTop: 4, textAlign: 'center' },
});
