import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { getHistory, HistoryItem } from '../api';

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function HistoryScreen() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await getHistory());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load your CV history.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Past CVs</Text>
        <Pressable style={styles.refreshButton} onPress={load} disabled={loading}>
          <Text style={styles.refreshText}>Refresh</Text>
        </Pressable>
      </View>

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      )}

      {error && (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!loading && !error && items.length === 0 && (
        <Text style={styles.muted}>
          No CVs yet. Go to the Generate tab to make your first one!
        </Text>
      )}

      {!loading &&
        items.map((item) => (
          <View key={item.file} style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.fileName} numberOfLines={1}>
                {item.file}
              </Text>
              <View
                style={[styles.badge, item.type === 'pdf' ? styles.badgePdf : styles.badgeMd]}
              >
                <Text style={styles.badgeText}>{item.type === 'pdf' ? 'PDF' : 'Draft'}</Text>
              </View>
            </View>
            <Text style={styles.date}>{formatDate(item.modified)}</Text>
            {typeof item.overallScore === 'number' && (
              <Text style={styles.score}>Quality score: {item.overallScore}/100</Text>
            )}
          </View>
        ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f9' },
  content: { padding: 20, paddingBottom: 40 },
  center: { paddingVertical: 30, alignItems: 'center' },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 24, fontWeight: '700', color: '#1c1c1e' },
  refreshButton: {
    backgroundColor: '#e5e5ea',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  refreshText: { fontSize: 14, fontWeight: '600', color: '#2f6fed' },
  muted: { color: '#6e6e73', fontSize: 15, lineHeight: 21 },
  errorCard: { backgroundColor: '#fdecea', borderRadius: 12, padding: 14, marginBottom: 12 },
  errorText: { color: '#8a1f11', fontSize: 15, lineHeight: 21 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e2e6',
    padding: 14,
    marginBottom: 10,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  fileName: { flex: 1, fontSize: 15, fontWeight: '600', color: '#1c1c1e' },
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  badgePdf: { backgroundColor: '#dcefe1' },
  badgeMd: { backgroundColor: '#e3ecfd' },
  badgeText: { fontSize: 12, fontWeight: '700', color: '#3a3a3c' },
  date: { fontSize: 13, color: '#6e6e73', marginTop: 6 },
  score: { fontSize: 14, color: '#1f7a33', fontWeight: '600', marginTop: 4 },
});
