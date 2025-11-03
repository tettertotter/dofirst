/**
 * ProposalCard - Display a today proposal with actions
 *
 * Shows proposal details and action buttons (Accept, Decline, Move)
 */

import React from "react";

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

export interface ProposalCardProps {
  proposal: Proposal;
  /** Callback when proposal accepted */
  onAccept: (proposalId: string) => void;
  /** Callback when proposal declined */
  onDecline: (proposalId: string) => void;
  /** Callback when proposal moved (reschedule) */
  onMove: (proposalId: string) => void;
  /** Current user ID */
  currentUserId: string;
  /** Loading state */
  loading?: boolean;
}

const priorityColors: Record<number, string> = {
  1: "#ef4444", // Red
  2: "#f97316", // Orange
  3: "#3b82f6", // Blue
  4: "#6b7280", // Gray
  5: "#9ca3af"  // Light gray
};

const priorityLabels: Record<number, string> = {
  1: "Urgent",
  2: "High",
  3: "Medium",
  4: "Low",
  5: "Very Low"
};

export function ProposalCard({
  proposal,
  onAccept,
  onDecline,
  onMove,
  currentUserId,
  loading = false
}: ProposalCardProps) {
  const isProposer = proposal.proposed_by === currentUserId;
  const isRecipient = proposal.proposed_for === currentUserId;
  const canRespond = isRecipient && proposal.status === "proposed";

  const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    proposed: { bg: "#fef3c7", text: "#92400e", border: "#fde68a" },
    accepted: { bg: "#d1fae5", text: "#065f46", border: "#a7f3d0" },
    declined: { bg: "#fee2e2", text: "#991b1b", border: "#fecaca" },
    moved: { bg: "#e0e7ff", text: "#3730a3", border: "#c7d2fe" }
  };

  const statusColor = statusColors[proposal.status] || statusColors.proposed;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const proposedDate = new Date(date);
    proposedDate.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((proposedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays === -1) return "Yesterday";

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  };

  return (
    <div
      className="proposal-card"
      style={{
        background: "#fff",
        border: "1px solid #e5e5e5",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        transition: "box-shadow 0.2s ease"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0, marginBottom: 4 }}>
            {proposal.task_title}
          </h3>
          {proposal.task_description && (
            <p style={{ fontSize: 14, color: "#666", margin: 0, lineHeight: 1.5 }}>
              {proposal.task_description}
            </p>
          )}
        </div>

        {/* Status Badge */}
        <div
          style={{
            padding: "4px 10px",
            borderRadius: 12,
            fontSize: 12,
            fontWeight: 500,
            background: statusColor.bg,
            color: statusColor.text,
            border: `1px solid ${statusColor.border}`,
            whiteSpace: "nowrap",
            marginLeft: 12
          }}
        >
          {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
        </div>
      </div>

      {/* Meta Info */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12, fontSize: 13, color: "#666" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span>📅</span>
          <span>{formatDate(proposal.proposed_date)}</span>
        </div>

        {proposal.task_priority && (
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: priorityColors[proposal.task_priority]
              }}
            />
            <span>{priorityLabels[proposal.task_priority]}</span>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span>👤</span>
          <span>
            {isProposer ? "You proposed" : `Proposed by ${proposal.proposer_email || "Unknown"}`}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span>🕐</span>
          <span>{formatTime(proposal.proposed_at)}</span>
        </div>
      </div>

      {/* Actions */}
      {canRespond && (
        <div style={{ display: "flex", gap: 8, marginTop: 12, paddingTop: 12, borderTop: "1px solid #e5e5e5" }}>
          <button
            onClick={() => onAccept(proposal.id)}
            disabled={loading}
            style={{
              flex: 1,
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              background: "#22c55e",
              color: "#fff",
              fontSize: 14,
              fontWeight: 500,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              transition: "all 0.15s ease"
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.background = "#16a34a";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#22c55e";
            }}
          >
            ✓ Accept
          </button>

          <button
            onClick={() => onDecline(proposal.id)}
            disabled={loading}
            style={{
              flex: 1,
              padding: "8px 16px",
              borderRadius: 8,
              border: "1px solid #e5e5e5",
              background: "#fff",
              color: "#666",
              fontSize: 14,
              fontWeight: 500,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              transition: "all 0.15s ease"
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.background = "#f5f5f5";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#fff";
            }}
          >
            × Decline
          </button>

          <button
            onClick={() => onMove(proposal.id)}
            disabled={loading}
            style={{
              flex: 1,
              padding: "8px 16px",
              borderRadius: 8,
              border: "1px solid #e5e5e5",
              background: "#fff",
              color: "#666",
              fontSize: 14,
              fontWeight: 500,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
              transition: "all 0.15s ease"
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.background = "#f5f5f5";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#fff";
            }}
          >
            → Move
          </button>
        </div>
      )}

      {/* Info message for non-recipients */}
      {!canRespond && isRecipient && proposal.status !== "proposed" && (
        <div
          style={{
            marginTop: 12,
            padding: 8,
            borderRadius: 6,
            background: "#f5f5f5",
            fontSize: 13,
            color: "#666"
          }}
        >
          You {proposal.status} this proposal
        </div>
      )}

      {isProposer && !isRecipient && (
        <div
          style={{
            marginTop: 12,
            padding: 8,
            borderRadius: 6,
            background: "#f5f5f5",
            fontSize: 13,
            color: "#666"
          }}
        >
          Waiting for recipient response
        </div>
      )}
    </div>
  );
}
