import React, { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../auth/AuthContext';
import { studentApi } from '../api/studentApi';
import { EmptyState, ErrorBanner, LoadingBlock } from '../components/Feedback';
import { ScreeningNote, Tracker } from '../components/Tracker';
import type { HelsbApplication } from '../types';
import { spacing } from '../theme';
import { useTheme } from '../theme/ThemeContext';

export default function HelsbScreen() {
  const { token } = useAuth();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [application, setApplication] = useState<HelsbApplication | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setError('');
    try {
      setApplication(await studentApi.getHelsb(token));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load HELSB status.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
    >
      <ErrorBanner message={error} />
      {loading ? (
        <LoadingBlock text="Loading HELSB application…" />
      ) : application ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{application.applicationNumber}</Text>
          <Tracker stage={application.pipelineStage} tone="light" />
          <ScreeningNote text={application.screeningExplanation} tone="light" />
        </View>
      ) : (
        <EmptyState
          title="No HELSB application"
          detail="The server has no HELSB record for this student yet."
        />
      )}
    </ScrollView>
  );
}

function createStyles(colors: {
  surface: string; white: string; border: string; navy: string; muted: string;
}) {
  return StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  content: { padding: spacing.md, paddingBottom: 40 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: { fontWeight: '800', color: colors.navy, marginBottom: 8 },
  row: { paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.border },
  label: { color: colors.muted, fontSize: 12, marginBottom: 4 },
  value: { color: colors.navy, fontWeight: '700' },
  });
}
