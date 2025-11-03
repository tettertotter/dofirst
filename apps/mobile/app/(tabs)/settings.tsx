import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Switch } from 'react-native';
import { AppBar } from '../../components/AppBar';
import { getSupabaseClient } from '../../../web/lib/supabase-client';

export default function SettingsScreen() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
  }, []);

  const handleSignOut = async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    // Note: In a real app, you'd navigate to login screen here
  };

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
          <Text style={styles.emptyText}>Please sign in to view settings</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppBar />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>
          Manage your preferences and account
        </Text>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Dark Mode</Text>
              <Text style={styles.settingDescription}>
                Switch between light and dark themes
              </Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
              thumbColor={darkMode ? '#ffffff' : '#f3f4f6'}
            />
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingSubLabel}>Email</Text>
              <Text style={styles.settingValue}>{user.email}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
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
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#6b7280',
  },
  settingSubLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  settingValue: {
    fontSize: 14,
    color: '#111827',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 12,
  },
  signOutButton: {
    backgroundColor: '#ef4444',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
});
