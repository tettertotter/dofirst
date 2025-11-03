"use client";

import React, { useState, useEffect } from "react";
import { getSupabaseClient } from "../../../lib/supabase-client";
import {
  Card,
  CardContent,
  Spinner,
  useTheme,
  spacing,
  Button,
  Toggle,
  Divider,
  Modal,
  ModalHeader,
  ModalFooter,
  Input,
  Badge
} from "@todaypool/design-system";

interface Pool {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
}

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);
  const [poolsLoading, setPoolsLoading] = useState(false);
  const { resolvedColors, theme, setTheme } = useTheme();

  // Create pool modal state
  const [createPoolModalOpen, setCreatePoolModalOpen] = useState(false);
  const [poolName, setPoolName] = useState("");
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<string | undefined>();

  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchPools(session.user.id);
      }
      setLoading(false);
    });
  }, []);

  const fetchPools = async (userId: string) => {
    setPoolsLoading(true);
    try {
      const supabase = getSupabaseClient();

      // Get pools where user is owner
      const { data, error } = await supabase
        .from("pools")
        .select("id, name, owner_id, created_at")
        .eq("owner_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setPools(data || []);
    } catch (err) {
      console.error("Failed to fetch pools:", err);
    } finally {
      setPoolsLoading(false);
    }
  };

  const handleSignOut = async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const handleOpenCreatePoolModal = () => {
    setPoolName("");
    setMessage(undefined);
    setCreatePoolModalOpen(true);
  };

  const handleCloseCreatePoolModal = () => {
    setCreatePoolModalOpen(false);
    setPoolName("");
    setMessage(undefined);
  };

  const handleCreatePool = async () => {
    if (!poolName.trim()) {
      setMessage("Please enter a pool name");
      return;
    }

    setCreating(true);
    setMessage(undefined);

    try {
      const res = await fetch("/api/pools.create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: poolName,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to create pool");
      }

      setMessage("Pool created successfully!");

      // Refresh pools list
      if (user) {
        await fetchPools(user.id);
      }

      // Close modal after a short delay to show success message
      setTimeout(() => {
        handleCloseCreatePoolModal();
      }, 1000);

    } catch (err) {
      setMessage(`Error: ${err instanceof Error ? err.message : "Failed to create pool"}`);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh'
      }}>
        <Spinner size="lg" />
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
          Settings
        </h1>
        <p style={{
          fontSize: '14px',
          color: resolvedColors.text.secondary,
          margin: 0
        }}>
          Manage your preferences and account
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
        {/* Pools Section */}
        <Card>
          <CardContent>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: spacing.md
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: 600,
                color: resolvedColors.text.primary,
                margin: 0
              }}>
                Pools
              </h3>
              <Button
                size="sm"
                variant="primary"
                onClick={handleOpenCreatePoolModal}
              >
                + Create Pool
              </Button>
            </div>

            {poolsLoading ? (
              <div style={{ textAlign: 'center', padding: spacing.md }}>
                <Spinner size="sm" />
              </div>
            ) : pools.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: spacing.lg,
                color: resolvedColors.text.secondary,
                fontSize: '14px'
              }}>
                No pools yet. Create your first pool to get started.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
                {pools.map(pool => (
                  <div
                    key={pool.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: spacing.sm,
                      backgroundColor: resolvedColors.surface.secondary,
                      borderRadius: '8px'
                    }}
                  >
                    <div>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: 500,
                        color: resolvedColors.text.primary,
                        marginBottom: '2px'
                      }}>
                        {pool.name}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: resolvedColors.text.secondary
                      }}>
                        Created {new Date(pool.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge variant="success" size="sm">Owner</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Appearance Section */}
        <Card>
          <CardContent>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 600,
              color: resolvedColors.text.primary,
              margin: 0,
              marginBottom: spacing.md
            }}>
              Appearance
            </h3>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: resolvedColors.text.primary,
                  marginBottom: '4px'
                }}>
                  Dark Mode
                </div>
                <div style={{
                  fontSize: '13px',
                  color: resolvedColors.text.secondary
                }}>
                  Switch between light and dark themes
                </div>
              </div>
              <Toggle
                checked={theme === 'dark'}
                onChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Account Section */}
        <Card>
          <CardContent>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 600,
              color: resolvedColors.text.primary,
              margin: 0,
              marginBottom: spacing.md
            }}>
              Account
            </h3>
            {user && (
              <div style={{ marginBottom: spacing.md }}>
                <div style={{
                  fontSize: '13px',
                  color: resolvedColors.text.secondary,
                  marginBottom: '4px'
                }}>
                  Email
                </div>
                <div style={{
                  fontSize: '14px',
                  color: resolvedColors.text.primary
                }}>
                  {user.email}
                </div>
              </div>
            )}
            <Divider />
            <div style={{ marginTop: spacing.md }}>
              <Button
                onClick={handleSignOut}
                variant="danger"
                fullWidth
              >
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Pool Modal */}
      <Modal
        isOpen={createPoolModalOpen}
        onClose={handleCloseCreatePoolModal}
        size="sm"
      >
        <ModalHeader onClose={handleCloseCreatePoolModal}>
          Create Pool
        </ModalHeader>
        <div style={{ padding: spacing.lg }}>
          {message && (
            <div
              style={{
                padding: spacing.sm,
                borderRadius: '6px',
                background: message.startsWith("Error") ? "#fee" : "#efe",
                color: message.startsWith("Error") ? "#c00" : "#060",
                marginBottom: spacing.md,
                fontSize: '13px'
              }}
            >
              {message}
            </div>
          )}
          <div style={{ marginBottom: spacing.md }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              color: resolvedColors.text.primary,
              marginBottom: spacing.xs
            }}>
              Pool Name
            </label>
            <Input
              type="text"
              placeholder="My Pool"
              value={poolName}
              onChange={(e) => setPoolName(e.target.value)}
              disabled={creating}
              size="md"
              autoFocus
            />
            <p style={{
              fontSize: '12px',
              color: resolvedColors.text.secondary,
              marginTop: spacing.xs,
              marginBottom: 0
            }}>
              Choose a name that represents this group (e.g., "Family", "Work", "Personal")
            </p>
          </div>
        </div>
        <ModalFooter>
          <Button
            variant="secondary"
            onClick={handleCloseCreatePoolModal}
            disabled={creating}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleCreatePool}
            disabled={creating || !poolName.trim()}
          >
            {creating ? 'Creating...' : 'Create Pool'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
