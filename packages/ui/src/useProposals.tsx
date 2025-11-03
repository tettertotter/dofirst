/**
 * useProposals - React hook for managing today proposals
 *
 * Provides proposal fetching and response actions
 */

import { useState, useCallback, useEffect } from "react";
import { getSupabaseClient } from "../../web/lib/supabase-client";

export interface Proposal {
  id: string;
  task_title: string;
  task_description?: string;
  task_priority?: number;
  proposed_at: string;
  proposed_by: string;
  proposed_for: string;
  proposed_date: string;
  status: "proposed" | "accepted" | "declined" | "moved";
  proposer_email?: string;
}

export interface UseProposalsOptions {
  /** Auto-fetch on mount */
  autoFetch?: boolean;
  /** Poll interval in ms (0 = no polling) */
  pollInterval?: number;
  /** Filter by status */
  status?: "proposed" | "accepted" | "declined" | "moved";
}

export interface UseProposalsResult {
  /** Proposals list */
  proposals: Proposal[];
  /** Loading state */
  loading: boolean;
  /** Error */
  error: Error | null;
  /** Refetch proposals */
  refetch: () => Promise<void>;
  /** Respond to proposal */
  respond: (proposalId: string, action: "accept" | "decline" | "move", moveToDate?: string) => Promise<void>;
  /** Responding state */
  responding: boolean;
}

export function useProposals(options: UseProposalsOptions = {}): UseProposalsResult {
  const { autoFetch = true, pollInterval = 0, status } = options;

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(false);
  const [responding, setResponding] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Not authenticated");
      }

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
        .or(`proposed_by.eq.${user.id},proposed_for.eq.${user.id}`)
        .order("proposed_at", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Fetch proposer emails
      const proposerIds = [...new Set((data || []).map(p => p.proposed_by))];
      const { data: users } = await supabase
        .from("profiles")
        .select("id, email")
        .in("id", proposerIds);

      const emailMap = new Map(users?.map(u => [u.id, u.email]) || []);

      const proposalsWithEmails = (data || []).map(p => ({
        ...p,
        proposer_email: emailMap.get(p.proposed_by)
      }));

      setProposals(proposalsWithEmails as Proposal[]);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [status]);

  const respond = useCallback(async (
    proposalId: string,
    action: "accept" | "decline" | "move",
    moveToDate?: string
  ) => {
    setResponding(true);
    setError(null);

    try {
      const body: any = { proposalId, action };
      if (action === "move" && moveToDate) {
        body.moveToDate = moveToDate;
      }

      const res = await fetch("/api/today.respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to respond to proposal");
      }

      // Refetch proposals
      await refetch();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setResponding(false);
    }
  }, [refetch]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      refetch();
    }
  }, [autoFetch, refetch]);

  // Polling
  useEffect(() => {
    if (pollInterval <= 0) return;

    const interval = setInterval(() => {
      refetch();
    }, pollInterval);

    return () => clearInterval(interval);
  }, [pollInterval, refetch]);

  return {
    proposals,
    loading,
    error,
    refetch,
    respond,
    responding
  };
}
