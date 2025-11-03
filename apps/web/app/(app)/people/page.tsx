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

export default function PeoplePage() {
  const [user, setUser] = useState<any>(null);
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedPoolId, setSelectedPoolId] = useState<string>("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<string>("spouse");
  const [inviting, setInviting] = useState(false);
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
    } catch (err) {
      console.error("Failed to fetch pools and members:", err);
      toast.show({
        title: "Error",
        description: "Failed to fetch pool members",
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
      toast.show({
        title: "Validation Error",
        description: "Please enter an email address",
        variant: "error"
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      toast.show({
        title: "Invalid Email",
        description: "Please enter a valid email address",
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

      toast.show({
        title: "Success",
        description: data.message || "Member invited successfully",
        variant: "success"
      });

      // Refresh the members list
      if (user) {
        await fetchPoolsAndMembers(user.id);
      }

      handleCloseInviteModal();
    } catch (err: any) {
      console.error("Invite error:", err);
      toast.show({
        title: "Error",
        description: err.message || "Failed to invite member",
        variant: "error"
      });
    } finally {
      setInviting(false);
    }
  };

  const getRoleBadgeColor = (role: string): string => {
    switch (role) {
      case 'owner': return resolvedColors.status.success;
      case 'spouse': return resolvedColors.primary;
      case 'colleague': return resolvedColors.accent;
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

  if (loading) {
    return (
      <div>
        <div style={{ marginBottom: spacing.xl }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 700,
            color: resolvedColors.text.primary,
            margin: 0,
            marginBottom: spacing.xs
          }}>
            People
          </h1>
          <p style={{
            fontSize: '14px',
            color: resolvedColors.text.secondary,
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh'
      }}>
        <p style={{ color: resolvedColors.text.secondary }}>
          Please sign in to view pool members
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: spacing.xl }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 700,
          color: resolvedColors.text.primary,
          margin: 0,
          marginBottom: spacing.xs
        }}>
          People
        </h1>
        <p style={{
          fontSize: '14px',
          color: resolvedColors.text.secondary,
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
                    <Badge variant="neutral">
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
                  {pool.members.map(member => (
                    <div
                      key={member.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: spacing.sm,
                        backgroundColor: resolvedColors.surface.secondary,
                        borderRadius: '8px'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: 500,
                          color: resolvedColors.text.primary,
                          marginBottom: '2px'
                        }}>
                          {member.user.email}
                          {member.user.id === user.id && (
                            <span style={{
                              fontSize: '12px',
                              color: resolvedColors.text.tertiary,
                              marginLeft: spacing.xs
                            }}>
                              (you)
                            </span>
                          )}
                        </div>
                        {member.can_add && (
                          <div style={{
                            fontSize: '12px',
                            color: resolvedColors.text.secondary
                          }}>
                            Can add tasks
                          </div>
                        )}
                      </div>
                      <div style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        backgroundColor: getRoleBadgeColor(member.role),
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#ffffff'
                      }}>
                        {formatRole(member.role)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Invite Member Modal */}
      <Modal
        isOpen={inviteModalOpen}
        onClose={handleCloseInviteModal}
        size="sm"
      >
        <ModalHeader onClose={handleCloseInviteModal}>
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
