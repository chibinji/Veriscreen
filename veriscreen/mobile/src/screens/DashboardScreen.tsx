import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { TabParamList } from '../navigation/RootNavigator';
import { useAuth } from '../auth/AuthContext';
import { studentApi } from '../api/studentApi';
import { ErrorBanner, LoadingBlock } from '../components/Feedback';
import { StatusBadge } from '../components/StatusBadge';
import { ScreeningNote, Tracker } from '../components/Tracker';
import type { DocumentRecord, HelsbApplication } from '../types';
import { spacing } from '../theme';
import { useTheme } from '../theme/ThemeContext';

export default function DashboardScreen() {
  const { user, token } = useAuth();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const [application, setApplication] = useState<HelsbApplication | null>(null);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setError('');
    try {
      const [nextHelsb, nextDocs] = await Promise.all([
        studentApi.getHelsb(token),
        studentApi.getDocuments(token),
      ]);
      setApplication(nextHelsb);
      setDocuments(nextDocs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load dashboard.');
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
      <Text style={styles.hello}>Welcome {`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'there'}!</Text>

      <ErrorBanner message={error} />
      {loading ? (
        <LoadingBlock text="Loading dashboard…" />
      ) : (
        <>
          <View style={styles.trackerCard}>
            <Text style={styles.trackerLabel}>HELSB application</Text>
            {application ? (
              <>
                <Tracker stage={application.pipelineStage} />
                <ScreeningNote text={application.screeningExplanation} />
              </>
            ) : (
              <Text style={styles.emptyLight}>Not started</Text>
            )}
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Verified documents</Text>
              <Pressable onPress={() => navigation.navigate('Documents')}>
                <Text style={styles.link}>View all</Text>
              </Pressable>
            </View>
            {documents.length === 0 ? (
              <Text style={styles.empty}>No verified documents yet.</Text>
            ) : (
              documents.slice(0, 5).map((doc) => (
                <View key={doc.id} style={styles.docRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.docTitle}>{doc.typeLabel}</Text>
                    <Text style={styles.docMeta}>{doc.generatedAt || '—'}</Text>
                  </View>
                  <StatusBadge status="GENERATED" label="Verified" />
                </View>
              ))
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}

function createStyles(colors: {
  surface: string; white: string; border: string; navy: string; ink: string; muted: string; lapis: string;
}) {
  return StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  content: { padding: spacing.md, paddingBottom: 40 },
  hello: { fontSize: 26, fontWeight: '700', color: colors.navy, marginBottom: spacing.md },
  trackerCard: {
    backgroundColor: colors.ink,
    borderRadius: 20,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  trackerLabel: { color: '#d5e4de', fontWeight: '700', letterSpacing: 0.4 },
  emptyLight: { color: '#fff', fontSize: 20, fontWeight: '800', marginTop: 8 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  cardTitle: { fontWeight: '800', color: colors.navy },
  link: { color: colors.lapis, fontWeight: '700' },
  empty: { color: colors.muted, paddingVertical: 16, textAlign: 'center' },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  docTitle: { fontWeight: '700', color: colors.navy },
  docMeta: { color: colors.muted, fontSize: 12, marginTop: 2 },
  });
}
