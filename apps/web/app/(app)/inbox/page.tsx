"use client";

import React, { useState, useEffect } from "react";
import { getSupabaseClient } from "../../../lib/supabase-client";
import { Card, Spinner, useTheme, spacing, Badge, Button } from "@todaypool/design-system";

interface TaskSubmission {
  id: string;
  raw_text: string;
  source: string;
  status: string;
  created_at: string;
  created_task_id: string | null;
  parsed: any;
}

export default function InboxPage() {
  const [user, setUser] = useState<any>(null);
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { resolvedColors } = useTheme();

  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchSubmissions(session.user.id);
      } else {
        setLoading(false);
      }
    });
  }, []);

  const fetchSubmissions = async (userId: string) => {
    try {
      const supabase = getSupabaseClient();

      // Get pools user is a member of
      const { data: poolMembers } = await supabase
        .from("pool_members")
        .select("pool_id")
        .eq("user_id", userId);

      const poolIds = poolMembers?.map(pm => pm.pool_id) || [];

      if (poolIds.length === 0) {
        setSubmissions([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // Get task submissions for these pools
      const { data, error } = await supabase
        .from("task_submissions")
        .select("*")
        .in("pool_id", poolIds)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      setSubmissions(data || []);
    } catch (err) {
      console.error("Failed to fetch submissions:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    if (user) {
      setRefreshing(true);
      fetchSubmissions(user.id);
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'email': return '📧';
      case 'voice': return '🎤';
      case 'app': return '💻';
      case 'api': return '⚡';
      default: return '📝';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
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
      <div style={{ marginBottom: spacing.xl, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 700,
            color: resolvedColors.text.primary,
            margin: 0,
            marginBottom: spacing.xs
          }}>
            Inbox
          </h1>
          <p style={{
            fontSize: '14px',
            color: resolvedColors.text.secondary,
            margin: 0
          }}>
            {submissions.length} task{submissions.length !== 1 ? 's' : ''} captured from various sources
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing} variant="secondary" size="sm">
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {submissions.length === 0 ? (
        <Card>
          <div style={{ padding: spacing.xl, textAlign: 'center' }}>
            <p style={{
              color: resolvedColors.text.secondary,
              marginBottom: spacing.sm
            }}>
              Your inbox is empty
            </p>
            <p style={{
              fontSize: '13px',
              color: resolvedColors.text.tertiary
            }}>
              Tasks from email, voice, and other sources will appear here
            </p>
          </div>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
          {submissions.map((submission) => (
            <Card key={submission.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                  <span style={{ fontSize: '20px' }}>{getSourceIcon(submission.source)}</span>
                  <Badge variant={getStatusColor(submission.status) as any} size="sm">
                    {submission.status}
                  </Badge>
                </div>
                <span style={{
                  fontSize: '12px',
                  color: resolvedColors.text.tertiary
                }}>
                  {formatDate(submission.created_at)}
                </span>
              </div>

              <p style={{
                fontSize: '14px',
                color: resolvedColors.text.primary,
                marginBottom: spacing.sm,
                lineHeight: '1.5'
              }}>
                {submission.raw_text}
              </p>

              {submission.parsed && Object.keys(submission.parsed).length > 0 && (
                <div style={{
                  marginTop: spacing.sm,
                  padding: spacing.sm,
                  background: resolvedColors.background.secondary,
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: resolvedColors.text.secondary
                }}>
                  <strong>Parsed:</strong> {JSON.stringify(submission.parsed, null, 2)}
                </div>
              )}

              {submission.created_task_id && (
                <div style={{
                  marginTop: spacing.sm,
                  fontSize: '12px',
                  color: resolvedColors.text.success
                }}>
                  ✓ Task created: {submission.created_task_id}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
