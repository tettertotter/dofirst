import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { AppBar } from '../../components/AppBar';
import { getSupabaseClient } from '../../../web/lib/supabase-client';

export default function TodayScreen() {
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProposals(session.user.id);
      } else {
        setLoading(false);
      }
    });
  }, []);

  const fetchProposals = async (userId: string) => {
    try {
      const supabase = getSupabaseClient();

      const { data, error } = await supabase
        .from("today_proposals")
        .select(`
          id,
          task_title,
          task_priority,
          proposed_at,
          status
        `)
        .or(`proposed_by.eq.${userId},proposed_for.eq.${userId}`)
        .eq("status", "proposed")
        .order("proposed_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      setProposals(data || []);
    } catch (err) {
      console.error("Failed to fetch proposals:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    if (user) {
      setRefreshing(true);
      fetchProposals(user.id);
    }
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
          <Text style={styles.emptyText}>Please sign in to view proposals</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppBar />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.title}>Today Proposals</Text>
        <Text style={styles.subtitle}>
          {proposals.length} pending proposal{proposals.length !== 1 ? 's' : ''}
        </Text>

        {proposals.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No proposals yet</Text>
            <Text style={styles.emptySubtext}>
              Pull down to refresh
            </Text>
          </View>
        ) : (
          proposals.map((proposal) => (
            <View key={proposal.id} style={styles.card}>
              <Text style={styles.cardTitle}>{proposal.task_title}</Text>
              <View style={styles.cardMeta}>
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(proposal.task_priority) }]}>
                  <Text style={styles.badgeText}>P{proposal.task_priority}</Text>
                </View>
                <Text style={styles.timestamp}>
                  {new Date(proposal.proposed_at).toLocaleDateString()}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

function getPriorityColor(priority: number) {
  if (priority >= 4) return '#ef4444';
  if (priority === 3) return '#f59e0b';
  return '#6b7280';
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
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  timestamp: {
    fontSize: 12,
    color: '#9ca3af',
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
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
