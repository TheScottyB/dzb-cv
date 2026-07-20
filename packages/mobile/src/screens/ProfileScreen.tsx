import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { getProfile, saveProfile, Profile } from '../api';

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProfile();
      setProfile(data);
      setName(data.personalInfo?.name?.full ?? '');
      setEmail(data.personalInfo?.contact?.email ?? '');
      setPhone(data.personalInfo?.contact?.phone ?? '');
      setSummary(data.professionalSummary ?? '');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load your profile.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onSave = async () => {
    if (!profile) return;
    setSaving(true);
    setError(null);
    setSavedMessage(null);
    try {
      const updated: Profile = {
        ...profile,
        personalInfo: {
          ...profile.personalInfo,
          name: { ...(profile.personalInfo?.name ?? {}), full: name },
          contact: {
            ...(profile.personalInfo?.contact ?? {}),
            email,
            phone,
          },
        },
        professionalSummary: summary,
      };
      await saveProfile(updated);
      setProfile(updated);
      setSavedMessage('Saved! Your profile is up to date.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save your profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.muted}>Loading your profile…</Text>
      </View>
    );
  }

  const reviewNeeded = profile?.meta?.reviewNeeded ?? [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Your Profile</Text>

      {error && (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.smallButton} onPress={load}>
            <Text style={styles.smallButtonText}>Try again</Text>
          </Pressable>
        </View>
      )}

      {reviewNeeded.length > 0 && (
        <View style={styles.reviewCard}>
          <Text style={styles.reviewTitle}>Needs your confirmation</Text>
          {reviewNeeded.map((item, i) => (
            <Text key={i} style={styles.reviewItem}>
              {'•'} {item}
            </Text>
          ))}
        </View>
      )}

      <Text style={styles.label}>Full name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Phone</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Professional summary</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        value={summary}
        onChangeText={setSummary}
        multiline
        textAlignVertical="top"
      />

      <Pressable
        style={[styles.button, saving && styles.buttonDisabled]}
        onPress={onSave}
        disabled={saving || !profile}
      >
        <Text style={styles.buttonText}>{saving ? 'Saving…' : 'Save'}</Text>
      </Pressable>

      {savedMessage && <Text style={styles.saved}>{savedMessage}</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f9' },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 16, color: '#1c1c1e' },
  label: { fontSize: 14, fontWeight: '600', color: '#3a3a3c', marginTop: 14, marginBottom: 6 },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d1d6',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1c1c1e',
  },
  multiline: { minHeight: 140 },
  button: {
    marginTop: 24,
    backgroundColor: '#2f6fed',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#ffffff', fontSize: 17, fontWeight: '600' },
  saved: { marginTop: 12, color: '#1f7a33', fontSize: 15, textAlign: 'center' },
  muted: { color: '#6e6e73' },
  errorCard: {
    backgroundColor: '#fdecea',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  errorText: { color: '#8a1f11', fontSize: 15, marginBottom: 10 },
  smallButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#8a1f11',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  smallButtonText: { color: '#ffffff', fontWeight: '600' },
  reviewCard: {
    backgroundColor: '#fff7e0',
    borderColor: '#f0d48a',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  reviewTitle: { fontSize: 16, fontWeight: '700', color: '#7a5b00', marginBottom: 8 },
  reviewItem: { fontSize: 14, color: '#5c4a10', marginBottom: 4, lineHeight: 20 },
});
