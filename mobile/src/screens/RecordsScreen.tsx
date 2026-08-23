import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../auth/AuthContext';
import { studentApi } from '../api/studentApi';
import { EmptyState, ErrorBanner, LoadingBlock } from '../components/Feedback';
import { StatusBadge } from '../components/StatusBadge';
import type { AcademicResult, ExamRecord, FeeRecord, RegistrationRecord } from '../types';
import { colors, spacing } from '../theme';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {children}
    </View>
  );
}

export default function RecordsScreen() {
  const { token } = useAuth();
  const [regs, setRegs] = useState<RegistrationRecord[]>([]);
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [exams, setExams] = useState<ExamRecord[]>([]);
  const [results, setResults] = useState<AcademicResult[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setError('');
    try {
      const [nextRegs, nextFees, nextExams, nextResults] = await Promise.all([
        studentApi.getRegistrations(token),
        studentApi.getFees(token),
        studentApi.getExaminations(token),
        studentApi.getAcademicResults(token),
      ]);
      setRegs(nextRegs);
      setFees(nextFees);
      setExams(nextExams);
      setResults(nextResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load academic records.');
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
        <LoadingBlock text="Loading academic records…" />
      ) : (
        <>
          <Section title="Registration">
            {regs.length === 0 ? (
              <EmptyState title="No registration records" />
            ) : (
              regs.map((row) => (
                <View key={row.id} style={styles.row}>
                  <View>
                    <Text style={styles.primary}>{row.academicYear} · Sem {row.semester}</Text>
                    <Text style={styles.meta}>{row.registeredAt || '—'}</Text>
                  </View>
                  <StatusBadge status={row.confirmationStatus} />
                </View>
              ))
            )}
          </Section>

          <Section title="Fee history">
            {fees.length === 0 ? (
              <EmptyState title="No fee records" />
            ) : (
              fees.map((row) => (
                <View key={row.id} style={styles.row}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={styles.primary}>{row.description}</Text>
                    <Text style={styles.meta}>{row.receiptNumber || '—'}</Text>
                    <Text style={styles.meta}>
                      K {row.paidAmount.toFixed(2)} / K {row.amount.toFixed(2)}
                    </Text>
                  </View>
                  <StatusBadge status={row.status} />
                </View>
              ))
            )}
          </Section>

          <Section title="Examination entries">
            {exams.length === 0 ? (
              <EmptyState title="No exam records" />
            ) : (
              exams.map((row) => (
                <View key={row.id} style={styles.row}>
                  <View>
                    <Text style={styles.primary}>{row.academicYear}</Text>
                    <Text style={styles.meta}>{row.status}</Text>
                  </View>
                  <StatusBadge status={row.sittingStatus} />
                </View>
              ))
            )}
          </Section>

          <Section title="Academic results">
            {results.length === 0 ? (
              <EmptyState title="No results yet" />
            ) : (
              results.map((row) => (
                <View key={row.id} style={styles.row}>
                  <View>
                    <Text style={styles.primary}>{row.courseCode}</Text>
                    <Text style={styles.meta}>{row.credits} credits</Text>
                  </View>
                  <Text style={styles.grade}>{row.grade}</Text>
                </View>
              ))
            )}
          </Section>
        </>
      )}
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
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: { fontWeight: '800', color: colors.navy, marginBottom: 8 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  primary: { fontWeight: '700', color: colors.navy },
  meta: { color: colors.muted, fontSize: 12, marginTop: 2 },
  grade: { fontWeight: '800', color: colors.indigo, fontSize: 18 },
});
