import React, { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { TabParamList } from '../navigation/RootNavigator';
import { useAuth } from '../auth/AuthContext';
import { studentApi } from '../api/studentApi';
import { ErrorBanner, LoadingBlock } from '../components/Feedback';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import type { DashboardStats, DocumentRecord } from '../types';
import { colors, spacing } from '../theme';

export default function DashboardScreen() {
  const { user, token } = useAuth();
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setError('');
    try {
      const [nextStats, nextDocs] = await Promise.all([
        studentApi.getDashboardStats(token),
        studentApi.getDocuments(token),
      ]);
      setStats(nextStats);
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
      <Text style={styles.hello}>Welcome back,</Text>
      <Text style={styles.name}>{user?.firstName || 'Student'}</Text>
      <Text style={styles.sub}>Overview of your verified academic records.</Text>

      <ErrorBanner message={error} />
      {loading ? (
        <LoadingBlock text="Loading dashboard…" />
      ) : (
        <>
          <View style={styles.stats}>
            <StatCard title="Documents verified" value={stats?.documentsGenerated ?? 0} icon="document-text-outline" />
            <View style={{ width: 12 }} />
            <StatCard title="Active applications" value={stats?.activeApplications ?? 0} icon="send-outline" />
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

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  content: { padding: spacing.md, paddingBottom: 40 },
  hello: { color: colors.muted, fontWeight: '600' },
  name: { fontSize: 28, fontWeight: '800', color: colors.lapis },
  sub: { color: colors.muted, marginBottom: spacing.md },
  stats: { flexDirection: 'row', marginBottom: spacing.md },
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
