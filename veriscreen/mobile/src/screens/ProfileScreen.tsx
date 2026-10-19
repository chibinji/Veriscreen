import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../auth/AuthContext';
import { studentApi } from '../api/studentApi';
import { ErrorBanner, LoadingBlock } from '../components/Feedback';
import { StatusBadge } from '../components/StatusBadge';
import type { StudentProfile } from '../types';
import { spacing } from '../theme';
import { useTheme } from '../theme/ThemeContext';

export default function ProfileScreen() {
  const { token, user, logout } = useAuth();
  const { colors, mode, setDark } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

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

          <View style={styles.card}>
            <View style={styles.settingRow}>
              <Text style={styles.value}>Dark mode</Text>
              <Switch
                value={mode === 'dark'}
                onValueChange={setDark}
                trackColor={{ false: '#d5e4de', true: colors.gold }}
                thumbColor="#fff"
              />
            </View>
            <Pressable style={styles.settingRow} onPress={() => setHelpOpen(true)}>
              <Text style={styles.value}>Help</Text>
            </Pressable>
          </View>

          <Pressable
            style={styles.logout}
            onPress={() => {
              Alert.alert('Sign out', 'Are you sure you want to sign out?', [
                { text: 'Stay signed in', style: 'cancel' },
                { text: 'Sign out', style: 'destructive', onPress: () => logout() },
              ]);
            }}
          >
            <Text style={styles.logoutText}>Sign out</Text>
          </Pressable>

          <Modal visible={helpOpen} transparent animationType="fade" onRequestClose={() => setHelpOpen(false)}>
            <Pressable style={styles.overlay} onPress={() => setHelpOpen(false)}>
              <Pressable style={styles.helpCard} onPress={() => undefined}>
                <Text style={styles.name}>Help</Text>
                <Text style={styles.helpBody}>Sign in with your computer number. Password for the demo accounts is password123.</Text>
                <Text style={styles.helpBody}>Documents carry a QR code with the time the document was issued. Scanning it opens a green verified page.</Text>
                <Text style={styles.helpBody}>The HELSB tracker updates when an officer moves the application forward.</Text>
                <Text style={styles.helpBody}>Dark mode is the switch above. It stays on this phone.</Text>
                <Pressable style={styles.logout} onPress={() => setHelpOpen(false)}>
                  <Text style={styles.logoutText}>Close</Text>
                </Pressable>
              </Pressable>
            </Pressable>
          </Modal>
        </>
      )}
    </ScrollView>
  );
}

function createStyles(colors: {
  surface: string;
  white: string;
  border: string;
  lapis: string;
  muted: string;
  navy: string;
  danger: string;
}) {
  return StyleSheet.create({
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
  initials: { color: '#fff', fontWeight: '800', fontSize: 24 },
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
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
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
  overlay: { flex: 1, backgroundColor: 'rgba(16,24,22,0.45)', justifyContent: 'center', padding: 20 },
  helpCard: { backgroundColor: colors.white, borderRadius: 16, padding: spacing.md },
  helpBody: { color: colors.muted, marginTop: 10, lineHeight: 20 },
  });
}
