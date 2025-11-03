import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { AppBar } from '../../components/AppBar';
import { getSupabaseClient } from '../../../web/lib/supabase-client';

export default function InboxScreen() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <AppBar />
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <AppBar />
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>Please sign in to view inbox</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppBar />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Inbox</Text>
        <Text style={styles.subtitle}>
          Capture tasks from email and other sources
        </Text>

        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Your inbox is empty</Text>
          <Text style={styles.emptySubtext}>
            Tasks from email will appear here
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContent: {
    padding: 16,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
});
