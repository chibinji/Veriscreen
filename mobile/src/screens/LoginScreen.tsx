import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { BrandLogo } from '../components/BrandLogo';
import { ErrorBanner } from '../components/Feedback';
import { DEMO_ACCOUNTS } from '../constants';
import { useAuth } from '../auth/AuthContext';
import { colors, spacing } from '../theme';

export default function LoginScreen() {
  const { login } = useAuth();
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError('');
    if (!studentId.trim() || !password) {
      setError('Enter your student number and password.');
      return;
    }
    setLoading(true);
    try {
      await login(studentId, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <BrandLogo size="lg" />
        <Text style={styles.heading}>Sign in</Text>
        <Text style={styles.sub}>Secure academic document verification</Text>

        <View style={styles.card}>
          <ErrorBanner message={error} />
          <Text style={styles.label}>Student number</Text>
          <TextInput
            value={studentId}
            onChangeText={setStudentId}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="number-pad"
            placeholder="2021465934"
            placeholderTextColor={colors.muted}
            style={styles.input}
          />
          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Enter password"
            placeholderTextColor={colors.muted}
            style={styles.input}
          />
          <Pressable style={[styles.button, loading && styles.buttonDisabled]} onPress={onSubmit} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Signing in…' : 'Sign in'}</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.demoTitle}>Seeded student accounts</Text>
          <Text style={styles.demoHint}>Tap a row to fill the form. Password is password123.</Text>
          {DEMO_ACCOUNTS.map((account) => (
            <Pressable
              key={account.id}
              style={styles.demoRow}
              onPress={() => {
                setStudentId(account.id);
                setPassword(account.password);
                setError('');
              }}
            >
              <View>
                <Text style={styles.demoId}>{account.id}</Text>
                <Text style={styles.demoLabel}>{account.label}</Text>
              </View>
              <Text style={styles.use}>Use</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  content: { padding: spacing.lg, paddingTop: 72 },
  heading: { marginTop: spacing.lg, fontSize: 28, fontWeight: '800', color: colors.navy },
  sub: { color: colors.muted, marginBottom: spacing.lg },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: { fontWeight: '700', color: colors.navy, marginBottom: 6, marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: colors.ink,
    backgroundColor: '#fbfcfe',
  },
  button: {
    marginTop: spacing.md,
    backgroundColor: colors.indigo,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: colors.white, fontWeight: '700', fontSize: 16 },
  demoTitle: { fontWeight: '800', color: colors.navy, marginBottom: 4 },
  demoHint: { color: colors.muted, fontSize: 12, marginBottom: 10 },
  demoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  demoId: { fontWeight: '700', color: colors.indigo },
  demoLabel: { color: colors.muted, fontSize: 12, marginTop: 2, maxWidth: 220 },
  use: { color: colors.lapis, fontWeight: '700' },
});
