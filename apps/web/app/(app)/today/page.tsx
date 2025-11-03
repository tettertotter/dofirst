"use client";

import React, { useEffect, useState } from "react";
import { getSupabaseClient } from "../../../lib/supabase-client";
import { Card, Button, Skeleton, DatePicker, useToast } from "@todaypool/design-system";
import { ProposalCard, type Proposal } from "@todaypool/ui";

export default function TodayPage() {
  const [user, setUser] = useState<any>(null);
  const [poolId, setPoolId] = useState<string | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [movingProposal, setMovingProposal] = useState<Proposal | null>(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { setLoading(false); return; }
      setUser(session.user);
      // naive pool discovery
      const { data: pm } = await supabase.from("pool_members").select("pool_id").eq("user_id", session.user.id).limit(1).single();
      if (pm) setPoolId(pm.pool_id);
      // load proposals
      fetchProposals();
    });
  }, []);

  async function fetchProposals() {
    const supabase = getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data } = await supabase
      .from("today_proposals")
      .select("*")
      .eq("proposed_for", session.user.id)
      .order("proposed_at", { ascending: false });
    setProposals((data as any) || []);
    setLoading(false);
  }

  async function accept(id: string) {
    setActionLoading(id);
    try {
      const res = await fetch("/api/today.respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposalId: id, action: "accept" })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || data.error || "Failed to accept");
      }

      // Optimistic UI: remove from list
      setProposals(prev => prev.filter(p => p.id !== id));
      showToast({ variant: "success", message: "✓ Accepted and added to your schedule" });
    } catch (err: any) {
      showToast({ variant: "error", message: err.message || "Failed to accept proposal" });
    } finally {
      setActionLoading(null);
    }
  }

  async function decline(id: string) {
    setActionLoading(id);
    try {
      const res = await fetch("/api/today.respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposalId: id, action: "decline" })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || data.error || "Failed to decline");
      }

      // Optimistic UI: remove from list
      setProposals(prev => prev.filter(p => p.id !== id));
      showToast({ variant: "success", message: "Proposal declined" });
    } catch (err: any) {
      showToast({ variant: "error", message: err.message || "Failed to decline proposal" });
    } finally {
      setActionLoading(null);
    }
  }

  function move(id: string) {
    const proposal = proposals.find(p => p.id === id);
    if (!proposal) return;
    setMovingProposal(proposal);
    setDatePickerOpen(true);
  }

  async function handleDateSelect(date: Date) {
    if (!movingProposal) return;

    setActionLoading(movingProposal.id);
    setDatePickerOpen(false);

    try {
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

      const res = await fetch("/api/today.respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposalId: movingProposal.id,
          action: "move",
          newDate: dateStr
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || data.error || "Failed to move");
      }

      // Optimistic UI: remove from list
      setProposals(prev => prev.filter(p => p.id !== movingProposal.id));
      showToast({ variant: "success", message: `Moved to ${date.toLocaleDateString()}` });
    } catch (err: any) {
      showToast({ variant: "error", message: err.message || "Failed to move proposal" });
    } finally {
      setActionLoading(null);
      setMovingProposal(null);
    }
  }

  if (loading) {
    return <div className="container"><Skeleton height={80} /><Skeleton height={80} /><Skeleton height={80} /></div>;
  }

  return (
    <>
      <div className="container main-grid">
        <Card>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ margin: 0 }}>Today</h2>
            <div><Button onClick={() => window.location.assign("/pool")}>Go to Pool</Button></div>
          </div>
        </Card>
        {proposals.length === 0 ? (
          <Card><p>No proposals yet. Ask your partner/colleagues to propose items for Today.</p></Card>
        ) : (
          proposals.map((p) => (
            <ProposalCard
              key={p.id}
              proposal={p}
              currentUserId={user?.id ?? ""}
              onAccept={accept}
              onDecline={decline}
              onMove={move}
              disabled={actionLoading === p.id}
            />
          ))
        )}
      </div>

      {/* DatePicker for Move action */}
      <DatePicker
        open={datePickerOpen}
        onClose={() => {
          setDatePickerOpen(false);
          setMovingProposal(null);
        }}
        onSelect={handleDateSelect}
        title="Move to which date?"
      />
    </>
  );
}
