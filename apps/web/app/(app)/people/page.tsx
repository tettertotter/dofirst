"use client";

import React, { useState, useEffect } from "react";
import { getSupabaseClient } from "../../../lib/supabase-client";
import {
  Card,
  CardContent,
  Spinner,
  useTheme,
  spacing,
  Badge,
  Skeleton,
  Button,
  Modal,
  ModalHeader,
  ModalFooter,
  Input,
  Select,
  useToast,
  type SelectOption
} from "@todaypool/design-system";

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

interface TodayLimit {
  delegate_id: string;
  today_limit: number | null;
}

export default function PeoplePage() {
  const [user, setUser] = useState<any>(null);
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedPoolId, setSelectedPoolId] = useState<string>("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<string>("spouse");
  const [inviting, setInviting] = useState(false);
  const [todayLimits, setTodayLimits] = useState<Map<string, TodayLimit>>(new Map());
  const [updatingLimit, setUpdatingLimit] = useState<string | null>(null);
  const { resolvedColors } = useTheme();
  const toast = useToast();

  const roleOptions: SelectOption[] = [
    { value: "spouse", label: "Spouse" },
    { value: "colleague", label: "Colleague" },
    { value: "guest", label: "Guest" }
  ];

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

      // Fetch today limits for the current user
      const { data: limits, error: limitsError } = await supabase
        .from("today_limits")
        .select("delegate_id, today_limit")
        .in("pool_id", poolIds)
        .eq("owner_id", userId);

      if (!limitsError && limits) {
        const limitsMap = new Map<string, TodayLimit>();
        limits.forEach((limit: any) => {
          limitsMap.set(limit.delegate_id, {
            delegate_id: limit.delegate_id,
            today_limit: limit.today_limit
          });
        });
        setTodayLimits(limitsMap);
      }
    } catch (err) {
      console.error("Failed to fetch pools and members:", err);
      toast.showToast({
        message: "Error: Failed to fetch pool members",
        variant: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenInviteModal = (poolId: string) => {
    setSelectedPoolId(poolId);
    setInviteEmail("");
    setInviteRole("spouse");
    setInviteModalOpen(true);
  };

  const handleCloseInviteModal = () => {
    setInviteModalOpen(false);
    setSelectedPoolId("");
    setInviteEmail("");
    setInviteRole("spouse");
  };

  const handleInviteMember = async () => {
    if (!inviteEmail || !selectedPoolId) {
      toast.showToast({
        message: "Validation Error: Please enter an email address",
        variant: "error"
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      toast.showToast({
        message: "Invalid Email: Please enter a valid email address",
        variant: "error"
      });
      return;
    }

    setInviting(true);

    try {
      const response = await fetch("/api/members.invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          poolId: selectedPoolId,
          email: inviteEmail,
          role: inviteRole
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to invite member");
      }

      toast.showToast({
        message: data.message || "Member invited successfully",
        variant: "success"
      });

      // Refresh the members list
      if (user) {
        await fetchPoolsAndMembers(user.id);
      }

      handleCloseInviteModal();
    } catch (err: any) {
      console.error("Invite error:", err);
      toast.showToast({
        message: "Error: " + (err.message || "Failed to invite member"),
        variant: "error"
      });
    } finally {
      setInviting(false);
    }
  };

  const getRoleBadgeColor = (role: string): string => {
    switch (role) {
      case 'owner': return resolvedColors.semantic.success;
      case 'spouse': return resolvedColors.interactive.primary;
      case 'colleague': return resolvedColors.interactive.secondary;
      case 'guest': return resolvedColors.text.tertiary;
      default: return resolvedColors.text.secondary;
    }
  };

  const formatRole = (role: string): string => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const isPoolOwner = (poolId: string): boolean => {
    const pool = pools.find(p => p.id === poolId);
    return pool?.owner_id === user?.id;
  };

  const handleUpdateTodayLimit = async (poolId: string, delegateId: string, newLimit: number | null) => {
    setUpdatingLimit(delegateId);
    try {
      const response = await fetch("/api/today-limit.update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          poolId,
          delegateId,
          todayLimit: newLimit
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update today limit");
      }

      // Update local state
      setTodayLimits(prev => {
        const newMap = new Map(prev);
        newMap.set(delegateId, {
          delegate_id: delegateId,
          today_limit: newLimit
        });
        return newMap;
      });

      const limitText = newLimit === null ? "Unlimited" : newLimit === 0 ? "None" : `${newLimit}`;
      toast.showToast({
        message: `Success: Today limit updated to ${limitText}`,
        variant: "success"
      });
    } catch (err: any) {
      console.error("Update today limit error:", err);
      toast.showToast({
        message: "Error: " + (err.message || "Failed to update today limit"),
        variant: "error"
      });
    } finally {
      setUpdatingLimit(null);
    }
  };

  const getTodayLimitLabel = (limit: number | null): string => {
    if (limit === null) return "Unlimited";
    if (limit === 0) return "None";
    return `${limit} task${limit !== 1 ? 's' : ''}`;
  };

  if (loading) {
    return (
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '48px 48px 64px 48px'
      }}>
        <div style={{ marginBottom: '48px' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 600,
            margin: 0,
            letterSpacing: '-0.02em',
            marginBottom: '12px'
          }}>
            People
          </h1>
          <p style={{
            fontSize: '15px',
            fontWeight: 400,
            opacity: 0.6,
            lineHeight: 1.5,
            margin: 0
          }}>
            Manage your pool members and permissions
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
          {[1, 2].map(i => (
            <Card key={i}>
              <CardContent>
                <Skeleton width="40%" height="20px" style={{ marginBottom: spacing.md }} />
                <Skeleton width="100%" height="16px" style={{ marginBottom: spacing.xs }} />
                <Skeleton width="100%" height="16px" style={{ marginBottom: spacing.xs }} />
                <Skeleton width="80%" height="16px" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '48px'
      }}>
        <p style={{ color: resolvedColors.text.secondary }}>
          Please sign in to view pool members
        </p>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '48px 48px 64px 48px'
    }}>
      <div style={{ marginBottom: '48px' }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 600,
          margin: 0,
          letterSpacing: '-0.02em',
          marginBottom: '12px'
        }}>
          People
        </h1>
        <p style={{
          fontSize: '15px',
          fontWeight: 400,
          opacity: 0.6,
          lineHeight: 1.5,
          margin: 0
        }}>
          {pools.length} pool{pools.length !== 1 ? 's' : ''} • {pools.reduce((sum, p) => sum + p.members.length, 0)} member{pools.reduce((sum, p) => sum + p.members.length, 0) !== 1 ? 's' : ''}
        </p>
      </div>

      {pools.length === 0 ? (
        <Card>
          <CardContent>
            <div style={{ padding: spacing.xl, textAlign: 'center' }}>
              <p style={{
                color: resolvedColors.text.secondary,
                marginBottom: spacing.lg
              }}>
                No pools found. Create a pool to start collaborating.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
          {pools.map(pool => (
            <Card key={pool.id}>
              <CardContent>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: spacing.md
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: 600,
                      color: resolvedColors.text.primary,
                      margin: 0
                    }}>
                      {pool.name}
                    </h3>
                    <Badge variant="secondary">
                      {pool.members.length} member{pool.members.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  {isPoolOwner(pool.id) && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleOpenInviteModal(pool.id)}
                    >
                      + Invite Member
                    </Button>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
                  {pool.members.map(member => {
                    const isCurrentUser = member.user.id === user.id;
                    const currentLimit = todayLimits.get(member.user.id);
                    const limitValue = currentLimit?.today_limit ?? 1;

                    const limitOptions: SelectOption[] = [
                      { value: "unlimited", label: "Unlimited" },
                      { value: "0", label: "None (0)" },
                      { value: "1", label: "1 task" },
                      { value: "2", label: "2 tasks" },
                      { value: "3", label: "3 tasks" },
                      { value: "5", label: "5 tasks" },
                      { value: "10", label: "10 tasks" }
                    ];

                    return (
                      <div
                        key={member.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: spacing.sm,
                          backgroundColor: resolvedColors.bg.secondary,
                          borderRadius: '8px',
                          gap: spacing.md
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: 500,
                            color: resolvedColors.text.primary,
                            marginBottom: '2px'
                          }}>
                            {member.user.email}
                            {isCurrentUser && (
                              <span style={{
                                fontSize: '12px',
                                color: resolvedColors.text.tertiary,
                                marginLeft: spacing.xs
                              }}>
                                (you)
                              </span>
                            )}
                          </div>
                          {!isCurrentUser && (
                            <div style={{
                              fontSize: '12px',
                              color: resolvedColors.text.secondary
                            }}>
                              Today limit: {getTodayLimitLabel(limitValue)}
                            </div>
                          )}
                        </div>

                        {!isCurrentUser && (
                          <div style={{ width: '140px' }}>
                            <Select
                              options={limitOptions}
                              value={limitValue === null ? "unlimited" : limitValue.toString()}
                              onChange={(value) => {
                                const newLimit = value === "unlimited" ? null : parseInt(value);
                                handleUpdateTodayLimit(pool.id, member.user.id, newLimit);
                              }}
                              disabled={updatingLimit === member.user.id}
                              size="sm"
                            />
                          </div>
                        )}

                        <div style={{
                          display: 'inline-block',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          backgroundColor: getRoleBadgeColor(member.role),
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#ffffff',
                          whiteSpace: 'nowrap'
                        }}>
                          {formatRole(member.role)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Invite Member Modal */}
      <Modal
        open={inviteModalOpen}
        onClose={handleCloseInviteModal}
        size="sm"
      >
        <ModalHeader>
          Invite Member
        </ModalHeader>
        <div style={{ padding: spacing.lg }}>
          <div style={{ marginBottom: spacing.md }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              color: resolvedColors.text.primary,
              marginBottom: spacing.xs
            }}>
              Email Address
            </label>
            <Input
              type="email"
              placeholder="colleague@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              disabled={inviting}
              size="md"
            />
          </div>
          <div style={{ marginBottom: spacing.md }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              color: resolvedColors.text.primary,
              marginBottom: spacing.xs
            }}>
              Role
            </label>
            <Select
              options={roleOptions}
              value={inviteRole}
              onChange={(value) => setInviteRole(value)}
              disabled={inviting}
              size="md"
            />
            <p style={{
              fontSize: '12px',
              color: resolvedColors.text.secondary,
              marginTop: spacing.xs,
              marginBottom: 0
            }}>
              {inviteRole === 'spouse' && 'Full access - can add tasks and manage pool'}
              {inviteRole === 'colleague' && 'Can add tasks and collaborate'}
              {inviteRole === 'guest' && 'View only - cannot add tasks'}
            </p>
          </div>
        </div>
        <ModalFooter>
          <Button
            variant="secondary"
            onClick={handleCloseInviteModal}
            disabled={inviting}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleInviteMember}
            disabled={inviting || !inviteEmail}
          >
            {inviting ? 'Sending...' : 'Send Invite'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
