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
import { useAuth } from '../auth/AuthContext';
import { colors, radii, spacing } from '../theme';

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
            placeholder="Student number"
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
    borderRadius: radii.card,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: { fontWeight: '700', color: colors.navy, marginBottom: 6, marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.control,
    paddingHorizontal: 20,
    paddingVertical: 14,
    color: colors.ink,
    backgroundColor: '#fbfcfe',
  },
  button: {
    marginTop: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderWidth: 1.5,
    borderColor: 'rgba(27,122,74,0.4)',
    borderRadius: radii.control,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: colors.navy, fontWeight: '700', fontSize: 16 },
});
