import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import GenerateScreen from './src/screens/GenerateScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import ProfileScreen from './src/screens/ProfileScreen';

type Tab = 'profile' | 'generate' | 'history';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'profile', label: 'Profile', icon: '👤' },
  { id: 'generate', label: 'Generate', icon: '📄' },
  { id: 'history', label: 'History', icon: '🕘' },
];

export default function App() {
  const [tab, setTab] = useState<Tab>('profile');

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.body}>
        {tab === 'profile' && <ProfileScreen />}
        {tab === 'generate' && <GenerateScreen />}
        {tab === 'history' && <HistoryScreen />}
      </View>
      <View style={styles.tabBar}>
        {TABS.map((t) => (
          <Pressable
            key={t.id}
            style={styles.tabButton}
            onPress={() => setTab(t.id)}
            accessibilityRole="button"
            accessibilityLabel={t.label}
          >
            <Text style={styles.tabIcon}>{t.icon}</Text>
            <Text style={[styles.tabLabel, tab === t.id && styles.tabLabelActive]}>
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f7f7f9' },
  body: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#d1d1d6',
    backgroundColor: '#ffffff',
    paddingBottom: 4,
  },
  tabButton: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  tabIcon: { fontSize: 20 },
  tabLabel: { fontSize: 12, color: '#6e6e73', marginTop: 2 },
  tabLabelActive: { color: '#2f6fed', fontWeight: '700' },
});
