import React, { useCallback, useState } from 'react';
import { Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../auth/AuthContext';
import { studentApi } from '../api/studentApi';
import { EmptyState, ErrorBanner, LoadingBlock } from '../components/Feedback';
import { StatusBadge } from '../components/StatusBadge';
import type { DocumentRecord } from '../types';
import { colors, radii, spacing } from '../theme';

export default function DocumentsScreen() {
  const { token } = useAuth();
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [preview, setPreview] = useState<DocumentRecord | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setError('');
    try {
      setDocuments(await studentApi.getDocuments(token));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load documents.');
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
        <LoadingBlock text="Loading documents…" />
      ) : documents.length === 0 ? (
        <EmptyState title="No verified documents" detail="Verified academic documents will appear here once they are available." />
      ) : (
        documents.map((doc) => (
          <View key={doc.id} style={styles.card}>
            <Text style={styles.title}>{doc.typeLabel}</Text>
            <Text style={styles.meta}>{doc.generatedAt || '—'}</Text>
            <Text style={styles.summary}>{doc.summary}</Text>
            <View style={styles.row}>
              <StatusBadge status="GENERATED" label="Verified" />
              <Pressable style={styles.preview} onPress={() => setPreview(doc)}>
                <Text style={styles.previewText}>Preview</Text>
              </Pressable>
            </View>
          </View>
        ))
      )}

      <Modal visible={!!preview} transparent animationType="fade" onRequestClose={() => setPreview(null)}>
        <Pressable style={styles.overlay} onPress={() => setPreview(null)}>
          <Pressable style={styles.modal} onPress={() => undefined}>
            <Text style={styles.modalTitle}>{preview?.typeLabel}</Text>
            <Text style={styles.meta}>{preview?.generatedAt}</Text>
            <Text style={styles.summary}>{preview?.summary}</Text>
            <Pressable style={styles.close} onPress={() => setPreview(null)}>
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  content: { padding: spacing.md, paddingBottom: 40 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: { fontWeight: '800', color: colors.navy, fontSize: 16 },
  meta: { color: colors.muted, marginTop: 4, fontSize: 12 },
  summary: { color: colors.ink, marginTop: 10, lineHeight: 20 },
  row: { marginTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  preview: {
    backgroundColor: colors.indigo,
    borderRadius: radii.control,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  previewText: { color: colors.white, fontWeight: '700', fontSize: 13 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modal: { backgroundColor: colors.white, borderRadius: 16, padding: spacing.lg },
  modalTitle: { fontSize: 18, fontWeight: '800', color: colors.navy },
  close: {
    marginTop: spacing.md,
    backgroundColor: colors.indigo,
    borderRadius: radii.control,
    paddingVertical: 14,
    alignItems: 'center',
  },
  closeText: { color: colors.white, fontWeight: '700' },
});
