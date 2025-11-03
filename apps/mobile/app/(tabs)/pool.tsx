import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { AppBar } from '../../components/AppBar';
import { getSupabaseClient } from '../../../web/lib/supabase-client';

export default function PoolScreen() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchTasks(session.user.id);
      } else {
        setLoading(false);
      }
    });
  }, []);

  const fetchTasks = async (userId: string) => {
    try {
      const supabase = getSupabaseClient();

      // Get all pools user is member of
      const { data: memberships, error: memberError } = await supabase
        .from("pool_members")
        .select("pool_id")
        .eq("user_id", userId);

      if (memberError) throw memberError;

      const poolIds = memberships?.map(m => m.pool_id) || [];

      if (poolIds.length === 0) {
        setTasks([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // Fetch all open tasks from user's pools
      const { data, error } = await supabase
        .from("tasks")
        .select(`
          id,
          title,
          description,
          priority,
          status,
          due_at,
          created_at
        `)
        .in("pool_id", poolIds)
        .eq("status", "open")
        .order("due_at", { ascending: true, nullsFirst: false })
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      setTasks(data || []);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    if (user) {
      setRefreshing(true);
      fetchTasks(user.id);
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
          <Text style={styles.emptyText}>Please sign in to view tasks</Text>
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
        <Text style={styles.title}>All Tasks</Text>
        <Text style={styles.subtitle}>
          {tasks.length} open task{tasks.length !== 1 ? 's' : ''}
        </Text>

        {tasks.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No open tasks</Text>
            <Text style={styles.emptySubtext}>
              Pull down to refresh
            </Text>
          </View>
        ) : (
          tasks.map((task) => (
            <View key={task.id} style={styles.card}>
              <Text style={styles.cardTitle}>{task.title}</Text>
              {task.description && (
                <Text style={styles.cardDescription} numberOfLines={2}>
                  {task.description}
                </Text>
              )}
              <View style={styles.cardMeta}>
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) }]}>
                  <Text style={styles.badgeText}>{getPriorityLabel(task.priority)}</Text>
                </View>
                {task.due_at && (
                  <View style={[styles.dueBadge, { backgroundColor: getDueColor(task.due_at) }]}>
                    <Text style={styles.badgeText}>{formatDueDate(task.due_at)}</Text>
                  </View>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

function getPriorityColor(priority: number | null) {
  if (!priority) return '#6b7280';
  if (priority >= 4) return '#ef4444'; // Urgent/High
  if (priority === 3) return '#f59e0b'; // Med
  return '#6b7280'; // Low/Info
}

function getPriorityLabel(priority: number | null) {
  if (!priority) return 'Info';
  if (priority === 5) return 'Urgent';
  if (priority === 4) return 'High';
  if (priority === 3) return 'Med';
  if (priority === 2) return 'Low';
  return 'Info';
}

function getDueColor(dueAt: string) {
  const now = new Date();
  const due = new Date(dueAt);
  const diffMins = Math.floor((due.getTime() - now.getTime()) / (1000 * 60));

  if (diffMins < 0) return '#ef4444'; // Overdue
  if (diffMins < 60) return '#f59e0b'; // Due soon
  return '#6b7280'; // Normal
}

function formatDueDate(dueAt: string) {
  const now = new Date();
  const due = new Date(dueAt);
  const diffMins = Math.floor((due.getTime() - now.getTime()) / (1000 * 60));

  if (diffMins < -1440) {
    // More than a day overdue
    const days = Math.floor(Math.abs(diffMins) / 1440);
    return `${days}d overdue`;
  } else if (diffMins < -60) {
    const hours = Math.floor(Math.abs(diffMins) / 60);
    return `${hours}h overdue`;
  } else if (diffMins < 0) {
    return `${Math.abs(diffMins)}m overdue`;
  } else if (diffMins < 60) {
    return `${diffMins}m`;
  } else if (diffMins < 1440) {
    const hours = Math.floor(diffMins / 60);
    return `${hours}h`;
  } else {
    const days = Math.floor(diffMins / 1440);
    return `${days}d`;
  }
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
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    lineHeight: 20,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  dueBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
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
