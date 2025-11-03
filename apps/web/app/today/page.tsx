"use client";

/**
 * Today page - View and respond to today proposals
 */

import React, { useState, useEffect } from "react";
import { getSupabaseClient } from "../../lib/supabase-client";
import { Card, Button, ProposalCard } from "@todaypool/ui";
import { DatePicker, InputModal, ProposalCardSkeleton, SwipeableCard, FAB, VoiceInput, Modal, PullToRefresh, NetworkStatus } from "@todaypool/design-system";
import type { Proposal } from "@todaypool/ui/src/ProposalCard";
import type { SwipeAction, FABAction } from "@todaypool/design-system";

export default function TodayPage() {
  const [user, setUser] = useState<any>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);
  const [message, setMessage] = useState<string | undefined>();
  const [filter, setFilter] = useState<"all" | "proposed" | "accepted" | "declined">("all");
  const [poolId, setPoolId] = useState<string | null>(null);

  // Modal state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [pendingProposalId, setPendingProposalId] = useState<string | null>(null);
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseClient();

    // Get current user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProposals(session.user.id);

        // Get user's first pool for quick add
        supabase
          .from("pool_members")
          .select("pool_id")
          .eq("user_id", session.user.id)
          .limit(1)
          .single()
          .then(({ data }) => {
            if (data) setPoolId(data.pool_id);
          });
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProposals(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProposals = async (userId: string) => {
    setLoading(true);
    try {
      const supabase = getSupabaseClient();

      // Query today_proposals
      let query = supabase
        .from("today_proposals")
        .select(`
          id,
          task_title,
          task_description,
          task_priority,
          proposed_at,
          proposed_by,
          proposed_for,
          proposed_date,
          status
        `)
        .or(`proposed_by.eq.${userId},proposed_for.eq.${userId}`)
        .order("proposed_at", { ascending: false });

      if (filter !== "all") {
        query = query.eq("status", filter);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch proposer emails
      const proposerIds = [...new Set((data || []).map((p: any) => p.proposed_by))];
      const { data: users } = await supabase
        .from("profiles")
        .select("id, email")
        .in("id", proposerIds);

      const emailMap = new Map(users?.map((u: any) => [u.id, u.email]) || []);

      const proposalsWithEmails = (data || []).map((p: any) => ({
        ...p,
        proposer_email: emailMap.get(p.proposed_by)
      }));

      setProposals(proposalsWithEmails as Proposal[]);
    } catch (err) {
      console.error("Failed to fetch proposals:", err);
      setMessage(`Error: ${err instanceof Error ? err.message : "Failed to load proposals"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (proposalId: string, action: "accept" | "decline" | "move") => {
    // For move action, show date picker modal
    if (action === "move") {
      setPendingProposalId(proposalId);
      setShowDatePicker(true);
      return;
    }

    // For accept/decline, execute immediately
    setResponding(true);
    setMessage(undefined);

    try {
      const body: any = { proposalId, action };

      const res = await fetch("/api/today.respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to respond to proposal");
      }

      setMessage(`✓ Proposal ${action}ed successfully`);

      // Refetch proposals
      if (user) {
        await fetchProposals(user.id);
      }

      // Clear success message after 3 seconds
      setTimeout(() => setMessage(undefined), 3000);
    } catch (err) {
      setMessage(`Error: ${err instanceof Error ? err.message : "Failed to respond"}`);
    } finally {
      setResponding(false);
    }
  };

  const handleDateSelect = async (date: Date) => {
    if (!pendingProposalId) return;

    setResponding(true);
    setMessage(undefined);

    try {
      const formatDate = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const body = {
        proposalId: pendingProposalId,
        action: "move",
        moveToDate: formatDate(date)
      };

      const res = await fetch("/api/today.respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to respond to proposal");
      }

      setMessage(`✓ Proposal moved successfully`);

      // Refetch proposals
      if (user) {
        await fetchProposals(user.id);
      }

      // Clear success message after 3 seconds
      setTimeout(() => setMessage(undefined), 3000);
    } catch (err) {
      setMessage(`Error: ${err instanceof Error ? err.message : "Failed to respond"}`);
    } finally {
      setResponding(false);
      setPendingProposalId(null);
    }
  };

  async function signInWithMagicLink() {
    setShowEmailInput(true);
  }

  async function handleEmailSubmit(email: string) {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin
      }
    });

    if (error) {
      setMessage(`Sign in error: ${error.message}`);
    } else {
      setMessage("Check your email for the magic link!");
    }
  }

  async function signOut() {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    setUser(null);
    setProposals([]);
  }

  // Voice input handler
  const handleVoiceTranscript = async (text: string) => {
    if (!poolId) {
      setMessage("Error: No pool found. Please ensure you're a member of a pool.");
      setShowVoiceInput(false);
      return;
    }

    setResponding(true);
    setMessage(undefined);

    try {
      const res = await fetch("/api/tasks.quickAdd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          poolId,
          title: text
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to create task");
      }

      // Build success message with parsed details
      let successMsg = `✓ Task created: "${data.task.title}"`;

      const details: string[] = [];
      if (data.task.priority) details.push(`Priority: ${data.task.priority}`);
      if (data.parsed?.tags && data.parsed.tags.length > 0) {
        details.push(`Tags: ${data.parsed.tags.map((t: string) => '#' + t).join(' ')}`);
      }
      if (data.task.due_at) {
        const dueDate = new Date(data.task.due_at);
        details.push(`Due: ${dueDate.toLocaleString()}`);
      }

      if (details.length > 0) {
        successMsg += ` (${details.join(', ')})`;
      }

      setMessage(successMsg);
      setShowVoiceInput(false);

      // Clear success message after 7 seconds (longer for detailed message)
      setTimeout(() => setMessage(undefined), 7000);
    } catch (err) {
      setMessage(`Error: ${err instanceof Error ? err.message : "Failed to create task"}`);
    } finally {
      setResponding(false);
    }
  };

  // Text input handler
  const handleTextSubmit = async (text: string) => {
    if (!poolId) {
      setMessage("Error: No pool found. Please ensure you're a member of a pool.");
      setShowTextInput(false);
      return;
    }

    setResponding(true);
    setMessage(undefined);

    try {
      const res = await fetch("/api/tasks.quickAdd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          poolId,
          title: text
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to create task");
      }

      // Build success message with parsed details
      let successMsg = `✓ Task created: "${data.task.title}"`;

      const details: string[] = [];
      if (data.task.priority) details.push(`Priority: ${data.task.priority}`);
      if (data.parsed?.tags && data.parsed.tags.length > 0) {
        details.push(`Tags: ${data.parsed.tags.map((t: string) => '#' + t).join(' ')}`);
      }
      if (data.task.due_at) {
        const dueDate = new Date(data.task.due_at);
        details.push(`Due: ${dueDate.toLocaleString()}`);
      }

      if (details.length > 0) {
        successMsg += ` (${details.join(', ')})`;
      }

      setMessage(successMsg);
      setShowTextInput(false);

      // Clear success message after 7 seconds (longer for detailed message)
      setTimeout(() => setMessage(undefined), 7000);
    } catch (err) {
      setMessage(`Error: ${err instanceof Error ? err.message : "Failed to create task"}`);
    } finally {
      setResponding(false);
    }
  };

  // FAB quick actions
  const fabActions: FABAction[] = user ? [
    {
      label: "Voice Input",
      icon: "🎤",
      color: "#8b5cf6",
      onTrigger: () => setShowVoiceInput(true),
    },
    {
      label: "Text Input",
      icon: "⌨️",
      color: "#3b82f6",
      onTrigger: () => setShowTextInput(true),
    },
  ] : [];

  if (loading && !user) {
    return (
      <div style={{ textAlign: "center", marginTop: 40 }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>Today Proposals</h1>
        <Card>
          <p style={{ marginBottom: 16 }}>
            Sign in to view your today proposals.
          </p>
          <Button onClick={signInWithMagicLink}>Sign in with Email</Button>
          {message && <div style={{ marginTop: 12, color: "#666" }}>{message}</div>}
        </Card>
      </>
    );
  }

  const pendingCount = proposals.filter(p => p.status === "proposed" && p.proposed_for === user.id).length;

  // Pull-to-refresh handler
  const handleRefresh = async () => {
    if (user) {
      await fetchProposals(user.id);
    }
  };

  return (
    <>
      <NetworkStatus />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Today Proposals</h1>
        <Button onClick={signOut}>Sign Out</Button>
      </div>

      {/* Status Messages */}
      {message && (
        <div
          style={{
            padding: 12,
            borderRadius: 8,
            background: message.startsWith("Error") ? "#fee" : "#efe",
            color: message.startsWith("Error") ? "#c00" : "#060",
            marginBottom: 16,
            fontSize: 14
          }}
        >
          {message}
        </div>
      )}

      <PullToRefresh onRefresh={handleRefresh}>
        {/* Filter Tabs */}
        <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8 }}>
          {(["all", "proposed", "accepted", "declined"] as const).map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f);
                if (user) fetchProposals(user.id);
              }}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: filter === f ? "2px solid #000" : "1px solid #ddd",
                background: filter === f ? "#f5f5f5" : "#fff",
                fontSize: 14,
                fontWeight: filter === f ? 600 : 400,
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === "proposed" && pendingCount > 0 && (
                <span
                  style={{
                    marginLeft: 6,
                    padding: "2px 6px",
                    borderRadius: 10,
                    background: "#ef4444",
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 600
                  }}
                >
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </Card>

      {/* Proposals List */}
      {loading ? (
        <div>
          <ProposalCardSkeleton />
          <ProposalCardSkeleton />
          <ProposalCardSkeleton />
        </div>
      ) : proposals.length === 0 ? (
        <Card>
          <p style={{ textAlign: "center", color: "#666" }}>
            {filter === "all" ? "No proposals yet" : `No ${filter} proposals`}
          </p>
          <p style={{ textAlign: "center", color: "#999", fontSize: 14, marginTop: 8 }}>
            Proposals will appear here when someone suggests tasks for your today list
          </p>
        </Card>
      ) : (
        <div>
          {proposals.map((proposal) => {
            const isRecipient = proposal.proposed_for === user.id;
            const canRespond = isRecipient && proposal.status === "proposed";

            // Swipe actions (only for pending proposals user can respond to)
            const leftAction: SwipeAction | undefined = canRespond ? {
              label: "Accept",
              icon: "✓",
              color: "#22c55e",
              onTrigger: () => handleRespond(proposal.id, "accept"),
            } : undefined;

            const rightAction: SwipeAction | undefined = canRespond ? {
              label: "Decline",
              icon: "×",
              color: "#ef4444",
              onTrigger: () => handleRespond(proposal.id, "decline"),
            } : undefined;

            return (
              <SwipeableCard
                key={proposal.id}
                leftAction={leftAction}
                rightAction={rightAction}
                disabled={!canRespond}
              >
                <ProposalCard
                  proposal={proposal}
                  currentUserId={user.id}
                  onAccept={(id) => handleRespond(id, "accept")}
                  onDecline={(id) => handleRespond(id, "decline")}
                  onMove={(id) => handleRespond(id, "move")}
                  loading={responding}
                />
              </SwipeableCard>
            );
          })}
        </div>
      )}

        {/* Info Card */}
        <Card style={{ marginTop: 16, background: "#f9f9f9" }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>About Today Proposals</h3>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, lineHeight: 1.6, color: "#666" }}>
            <li><strong>Accept:</strong> Add the task to your today list</li>
            <li><strong>Decline:</strong> Reject the proposal (no task created)</li>
            <li><strong>Move:</strong> Reschedule to a different day</li>
          </ul>
          <p style={{ marginTop: 12, fontSize: 12, color: "#999", fontStyle: "italic" }}>
            💡 Tip: Pull down to refresh your proposals
          </p>
        </Card>
      </PullToRefresh>

      {/* Date Picker Modal */}
      <DatePicker
        open={showDatePicker}
        onClose={() => {
          setShowDatePicker(false);
          setPendingProposalId(null);
        }}
        onSelect={handleDateSelect}
        title="Move to which date?"
      />

      {/* Email Input Modal */}
      <InputModal
        open={showEmailInput}
        onClose={() => setShowEmailInput(false)}
        onSubmit={handleEmailSubmit}
        title="Sign in with Email"
        label="Email Address"
        placeholder="your@email.com"
        type="email"
        required
      />

      {/* Voice Input Modal */}
      <Modal
        open={showVoiceInput}
        onClose={() => setShowVoiceInput(false)}
        title="Voice Input"
        size="md"
      >
        <div style={{ padding: "20px 0" }}>
          <VoiceInput
            onTranscript={handleVoiceTranscript}
            onError={(error) => setMessage(`Voice input error: ${error}`)}
            showTranscript={true}
          />
          <div style={{ marginTop: 16, textAlign: "center" }}>
            <p style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>
              Speak naturally - your task will be created automatically
            </p>
            <p style={{ fontSize: 12, color: "#999", fontStyle: "italic" }}>
              Try: "Buy milk today 5pm #personal !2" or "Team meeting fri 9a #work !1"
            </p>
          </div>
        </div>
      </Modal>

      {/* Text Input Modal */}
      <InputModal
        open={showTextInput}
        onClose={() => setShowTextInput(false)}
        onSubmit={handleTextSubmit}
        title="Add Task"
        label="Task Description"
        placeholder="What needs to be done?"
        type="text"
        required
      />

      {/* FAB (only show when user is signed in) */}
      {user && (
        <FAB
          actions={fabActions}
          ariaLabel="Quick actions"
          variant="primary"
        />
      )}
    </>
  );
}
