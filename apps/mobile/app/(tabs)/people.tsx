import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { AppBar } from '../../components/AppBar';
import { getSupabaseClient } from '../../../web/lib/supabase-client';

interface PoolMember {
  id: string;
  role: string;
  can_add: boolean;
  user: {
    id: string;
    email: string;
  };
}

interface Pool {
  id: string;
  name: string;
  owner_id: string;
  members: PoolMember[];
}

export default function PeopleScreen() {
  const [user, setUser] = useState<any>(null);
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchPoolsAndMembers(session.user.id);
      } else {
        setLoading(false);
      }
    });
  }, []);

  const fetchPoolsAndMembers = async (userId: string) => {
    try {
      const supabase = getSupabaseClient();

      // Get all pools user is member of
      const { data: userPools, error: poolsError } = await supabase
        .from("pool_members")
        .select(`
          pool_id,
          pools:pool_id (
            id,
            name,
            owner_id
          )
        `)
        .eq("user_id", userId);

      if (poolsError) throw poolsError;

      const poolIds = userPools?.map((p: any) => p.pool_id) || [];

      if (poolIds.length === 0) {
        setPools([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // Get all members for these pools
      const { data: members, error: membersError } = await supabase
        .from("pool_members")
        .select(`
          id,
          pool_id,
          user_id,
          role,
          can_add,
          users:user_id (
            id,
            email
          )
        `)
        .in("pool_id", poolIds);

      if (membersError) throw membersError;

      // Group members by pool
      const poolsWithMembers: Pool[] = userPools.map((up: any) => {
        const pool = up.pools;
        const poolMembers = members
          ?.filter((m: any) => m.pool_id === pool.id)
          .map((m: any) => ({
            id: m.id,
            role: m.role,
            can_add: m.can_add,
            user: {
              id: m.users.id,
              email: m.users.email
            }
          })) || [];

        return {
          id: pool.id,
          name: pool.name,
          owner_id: pool.owner_id,
          members: poolMembers
        };
      });

      setPools(poolsWithMembers);
    } catch (err) {
      console.error("Failed to fetch pools and members:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    if (user) {
      setRefreshing(true);
      fetchPoolsAndMembers(user.id);
    }
  };

  const getRoleBadgeColor = (role: string): string => {
    switch (role) {
      case 'owner': return '#10b981';
      case 'spouse': return '#3b82f6';
      case 'colleague': return '#8b5cf6';
      case 'guest': return '#6b7280';
      default: return '#9ca3af';
    }
  };

  const formatRole = (role: string): string => {
    return role.charAt(0).toUpperCase() + role.slice(1);
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
          <Text style={styles.emptyText}>Please sign in to view pool members</Text>
        </View>
      </View>
    );
  }

  const totalMembers = pools.reduce((sum, p) => sum + p.members.length, 0);

  return (
    <View style={styles.container}>
      <AppBar />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.title}>People</Text>
        <Text style={styles.subtitle}>
          {pools.length} pool{pools.length !== 1 ? 's' : ''} • {totalMembers} member{totalMembers !== 1 ? 's' : ''}
        </Text>

        {pools.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No pools found</Text>
            <Text style={styles.emptySubtext}>
              Pull down to refresh
            </Text>
          </View>
        ) : (
          pools.map(pool => (
            <View key={pool.id} style={styles.poolCard}>
              <View style={styles.poolHeader}>
                <Text style={styles.poolName}>{pool.name}</Text>
                <View style={styles.memberCountBadge}>
                  <Text style={styles.badgeText}>
                    {pool.members.length} member{pool.members.length !== 1 ? 's' : ''}
                  </Text>
                </View>
              </View>

              {pool.members.map(member => (
                <View key={member.id} style={styles.memberCard}>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberEmail}>
                      {member.user.email}
                      {member.user.id === user.id && (
                        <Text style={styles.youLabel}> (you)</Text>
                      )}
                    </Text>
                    {member.can_add && (
                      <Text style={styles.permissionText}>Can add tasks</Text>
                    )}
                  </View>
                  <View style={[styles.roleBadge, { backgroundColor: getRoleBadgeColor(member.role) }]}>
                    <Text style={styles.roleText}>{formatRole(member.role)}</Text>
                  </View>
                </View>
              ))}
            </View>
          ))
        )}
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
  poolCard: {
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
  poolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  poolName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  memberCountBadge: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  memberCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 8,
  },
  memberInfo: {
    flex: 1,
  },
  memberEmail: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  youLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
  permissionText: {
    fontSize: 12,
    color: '#6b7280',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  roleText: {
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
