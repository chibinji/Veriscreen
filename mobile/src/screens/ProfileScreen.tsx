import React, { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../auth/AuthContext';
import { studentApi } from '../api/studentApi';
import { ErrorBanner, LoadingBlock } from '../components/Feedback';
import { StatusBadge } from '../components/StatusBadge';
import type { StudentProfile } from '../types';
import { colors, spacing } from '../theme';

export default function ProfileScreen() {
  const { token, user, logout } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setError('');
    try {
      setProfile(await studentApi.getProfile(token));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load profile.');
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

  const fullName = profile
    ? `${profile.firstName} ${profile.lastName}`.trim()
    : `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
    >
      <ErrorBanner message={error} />
      {loading ? (
        <LoadingBlock text="Loading profile…" />
      ) : (
        <>
          <View style={styles.hero}>
            <View style={styles.avatar}>
              <Text style={styles.initials}>{initials || 'S'}</Text>
            </View>
            <Text style={styles.name}>{fullName}</Text>
            <Text style={styles.number}>{profile?.studentNumber}</Text>
            <StatusBadge status={profile?.registrationStatus || 'ACTIVE'} />
          </View>

          <View style={styles.card}>
            {[
              ['Student number', profile?.studentNumber],
              ['Program', profile?.program || '—'],
              ['Year of study', profile?.yearOfStudy ? `Year ${profile.yearOfStudy}` : '—'],
              ['Enrollment year', profile?.enrollmentYear ? String(profile.enrollmentYear) : '—'],
              ['Registration', profile?.registrationStatus],
            ].map(([label, value]) => (
              <View key={label} style={styles.row}>
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.value}>{value}</Text>
              </View>
            ))}
          </View>

          <Pressable style={styles.logout} onPress={logout}>
            <Text style={styles.logoutText}>Sign out</Text>
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  content: { padding: spacing.md, paddingBottom: 40 },
  hero: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.lapis,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  initials: { color: colors.white, fontWeight: '800', fontSize: 24 },
  name: { fontSize: 20, fontWeight: '800', color: colors.lapis },
  number: { color: colors.muted, marginBottom: 8 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  label: { color: colors.muted, fontSize: 12, marginBottom: 4 },
  value: { color: colors.navy, fontWeight: '700' },
  logout: {
    marginTop: spacing.md,
    backgroundColor: '#fdecec',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutText: { color: colors.danger, fontWeight: '800' },
});
