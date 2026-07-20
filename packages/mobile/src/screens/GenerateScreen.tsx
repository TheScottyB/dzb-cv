import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { generateCV, GenerateResult } from '../api';

const SECTORS = [
  { id: 'healthcare', label: 'Healthcare' },
  { id: 'federal', label: 'Federal' },
  { id: 'tech', label: 'Tech' },
  { id: 'private', label: 'Private' },
] as const;

export default function GenerateScreen() {
  const [sector, setSector] = useState<string>('healthcare');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onGenerate = async () => {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await generateCV(sector);
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not generate the CV.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Generate a CV</Text>
      <Text style={styles.subtitle}>Pick the kind of job you are applying for:</Text>

      <View style={styles.sectorRow}>
        {SECTORS.map((s) => (
          <Pressable
            key={s.id}
            style={[styles.sectorButton, sector === s.id && styles.sectorSelected]}
            onPress={() => setSector(s.id)}
            disabled={busy}
          >
            <Text
              style={[styles.sectorText, sector === s.id && styles.sectorTextSelected]}
            >
              {s.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        style={[styles.button, busy && styles.buttonDisabled]}
        onPress={onGenerate}
        disabled={busy}
      >
        <Text style={styles.buttonText}>{busy ? 'Working on it…' : 'Generate CV'}</Text>
      </Pressable>

      {busy && (
        <View style={styles.busyRow}>
          <ActivityIndicator />
          <Text style={styles.muted}>
            This can take a minute — writing your CV, checking its quality, and making the
            PDF.
          </Text>
        </View>
      )}

      {error && (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {result && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Your CV is ready!</Text>

          <Text style={styles.sectionLabel}>Quality scores</Text>
          {Object.entries(result.scores).map(([label, value]) => (
            <View key={label} style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>{label}</Text>
              <Text style={styles.scoreValue}>{value}/100</Text>
            </View>
          ))}

          <Text style={styles.sectionLabel}>Files (on your computer)</Text>
          <Text style={styles.filePath}>{result.markdown}</Text>
          {result.pdf ? (
            <Text style={styles.filePath}>{result.pdf}</Text>
          ) : (
            <Text style={styles.muted}>
              The PDF is still being prepared — check the History tab in a moment.
            </Text>
          )}
          {result.note && <Text style={styles.muted}>{result.note}</Text>}

          <Text style={styles.hint}>
            To get the PDF: on your computer, open the project folder and look inside
            {' "output"'} — the newest file is the one above. You can print it or email it
            from there.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f9' },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8, color: '#1c1c1e' },
  subtitle: { fontSize: 15, color: '#3a3a3c', marginBottom: 14 },
  sectorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  sectorButton: {
    borderWidth: 1,
    borderColor: '#c7c7cc',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sectorSelected: { backgroundColor: '#2f6fed', borderColor: '#2f6fed' },
  sectorText: { fontSize: 15, color: '#1c1c1e', fontWeight: '500' },
  sectorTextSelected: { color: '#ffffff' },
  button: {
    backgroundColor: '#1f7a33',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#ffffff', fontSize: 17, fontWeight: '600' },
  busyRow: { flexDirection: 'row', gap: 10, alignItems: 'center', marginTop: 16 },
  muted: { color: '#6e6e73', fontSize: 14, flexShrink: 1, lineHeight: 20 },
  errorCard: { backgroundColor: '#fdecea', borderRadius: 12, padding: 14, marginTop: 16 },
  errorText: { color: '#8a1f11', fontSize: 15, lineHeight: 21 },
  resultCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#e2e2e6',
  },
  resultTitle: { fontSize: 18, fontWeight: '700', color: '#1f7a33', marginBottom: 8 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6e6e73',
    textTransform: 'uppercase',
    marginTop: 12,
    marginBottom: 6,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  scoreLabel: { fontSize: 15, color: '#1c1c1e' },
  scoreValue: { fontSize: 15, fontWeight: '600', color: '#2f6fed' },
  filePath: { fontSize: 13, color: '#3a3a3c', marginBottom: 4 },
  hint: { fontSize: 14, color: '#3a3a3c', marginTop: 12, lineHeight: 20 },
});
