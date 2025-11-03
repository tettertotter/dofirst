"use client";

import React, { useEffect, useState } from "react";
import { getSupabaseClient } from "../../../lib/supabase-client";
import { Card, Button, Skeleton, Input, Divider } from "@todaypool/design-system";
import { ProposalCard, type Proposal } from "@todaypool/ui";

export default function TodayPage() {
  const [user, setUser] = useState<any>(null);
  const [poolId, setPoolId] = useState<string | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { setLoading(false); return; }
      setUser(session.user);
      // naive pool discovery
      const { data: pm } = await supabase.from("pool_members").select("pool_id").eq("user_id", session.user.id).limit(1).single();
      if (pm) setPoolId(pm.pool_id);
      // load proposals
      const { data } = await supabase.from("today_proposals").select("*").eq("owner_id", session.user.id).order("proposed_at", { ascending: false });
      setProposals((data as any) || []);
      setLoading(false);
    });
  }, []);

  function accept(id: string) { /* TODO: call /api/today.respond */ }
  function decline(id: string) { /* TODO: call /api/today.respond */ }
  function move(id: string) { /* TODO: open date picker then call /api/today.respond */ }

  if (loading) {
    return <div className="container"><Skeleton height={80} /><Skeleton height={80} /><Skeleton height={80} /></div>;
  }

  return (
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
          />
        ))
      )}
    </div>
  );
}
