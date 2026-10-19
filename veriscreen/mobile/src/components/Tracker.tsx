import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TRACKER_STEPS } from '../constants';
import { colors, spacing } from '../theme';

export function Tracker({ stage, tone = 'dark' }: { stage?: string | null; tone?: 'dark' | 'light' }) {
  const current = Math.max(0, TRACKER_STEPS.findIndex((step) => step.id === stage));
  const light = tone === 'light';
  return (
    <View style={styles.grid}>
      {TRACKER_STEPS.map((step, index) => {
        const active = index <= current;
        return (
          <View key={step.id} style={[styles.step, light ? styles.stepLight : null, active && styles.stepActive]}>
            <Text style={[styles.index, light && styles.indexLight, active && styles.indexActive]}>{index + 1}</Text>
            <Text style={[styles.label, light && styles.labelLight, active && styles.labelActive]}>{step.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

export function ScreeningNote({ text, tone = 'dark' }: { text?: string | null; tone?: 'dark' | 'light' }) {
  if (!text) return null;
  const approved = text.startsWith('Approved');
  const light = tone === 'light';
  return (
    <Text style={[styles.note, approved ? (light ? styles.noteOkLight : styles.noteOk) : (light ? styles.noteNoLight : styles.noteNo)]}>
      {text}
    </Text>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: spacing.sm },
  step: {
    width: '48%',
    flexGrow: 1,
    minHeight: 44,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepActive: { backgroundColor: colors.gold },
  stepLight: { backgroundColor: '#e7f1ee' },
  indexLight: { color: colors.navy, backgroundColor: '#fff' },
  labelLight: { color: colors.navy },
  index: {
    width: 22,
    height: 22,
    borderRadius: 11,
    textAlign: 'center',
    lineHeight: 22,
    color: '#fff',
    backgroundColor: 'rgba(255,255,255,0.18)',
    fontWeight: '800',
    fontSize: 12,
  },
  indexActive: { color: colors.navy, backgroundColor: 'rgba(47,71,65,0.12)' },
  label: { color: '#d5e4de', fontWeight: '700', fontSize: 12, flex: 1 },
  labelActive: { color: colors.navy },
  note: {
    marginTop: spacing.md,
    borderRadius: 12,
    padding: 12,
    fontWeight: '700',
    lineHeight: 20,
  },
  noteOk: { backgroundColor: 'rgba(227,178,60,0.35)', color: '#fff8e8' },
  noteNo: { backgroundColor: 'rgba(255,255,255,0.14)', color: '#fff' },
  noteOkLight: { backgroundColor: '#d9f5e4', color: '#0f7b3a' },
  noteNoLight: { backgroundColor: '#fde8e8', color: '#9b1c1c' },
});
