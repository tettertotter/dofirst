/**
 * ProposalCard - Display a today proposal with actions
 *
 * Shows proposal details and action buttons (Accept, Decline, Move)
 */

import React from "react";
import { Button, Badge, spacing, useTheme } from "@todaypool/design-system";

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
  /** Disabled state (e.g., during loading) */
  disabled?: boolean;
}

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
  disabled = false
}: ProposalCardProps) {
  const { theme, resolvedColors } = useTheme();

  const isProposer = proposal.proposed_by === currentUserId;
  const isRecipient = proposal.proposed_for === currentUserId;
  const canRespond = isRecipient && proposal.status === "proposed";

  // Map status to Badge variant
  const statusVariantMap: Record<string, "warning" | "success" | "error" | "info"> = {
    proposed: "warning",
    accepted: "success",
    declined: "error",
    moved: "info"
  };

  // Map priority to color (using theme colors instead of hardcoded hex)
  const getPriorityColor = (priority: number): string => {
    switch (priority) {
      case 1: return theme.colors.error[500];    // Urgent - red
      case 2: return theme.colors.warning[500];  // High - orange
      case 3: return theme.colors.primary[500];  // Medium - blue
      case 4: return theme.colors.gray[700];     // Low - dark gray
      case 5: return theme.colors.gray[400];     // Very Low - light gray
      default: return theme.colors.gray[500];
    }
  };

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
      style={{
        background: resolvedColors.surface.default,
        border: `1px solid ${resolvedColors.border.default}`,
        borderRadius: theme.componentRadius.card.default,
        padding: spacing.md,
        marginBottom: spacing.sm,
        transition: `all ${theme.transition.card.value}`,
        boxShadow: theme.shadows.light.sm,
      }}
    >
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: spacing.sm,
        gap: spacing.sm
      }}>
        <div style={{ flex: 1 }}>
          <h3 style={{
            fontSize: theme.typography.sizes.base.fontSize,
            fontWeight: theme.typography.weights.semibold,
            margin: 0,
            marginBottom: spacing.xs,
            color: resolvedColors.text.primary
          }}>
            {proposal.task_title}
          </h3>
          {proposal.task_description && (
            <p style={{
              fontSize: theme.typography.sizes.sm.fontSize,
              color: resolvedColors.text.secondary,
              margin: 0,
              lineHeight: 1.5
            }}>
              {proposal.task_description}
            </p>
          )}
        </div>

        {/* Status Badge */}
        <Badge
          variant={statusVariantMap[proposal.status] || "warning"}
          size="sm"
        >
          {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
        </Badge>
      </div>

      {/* Meta Info */}
      <div style={{
        display: "flex",
        gap: spacing.sm,
        flexWrap: "wrap",
        marginBottom: spacing.sm,
        fontSize: theme.typography.sizes.sm.fontSize,
        color: resolvedColors.text.secondary
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: spacing.xs }}>
          <span>📅</span>
          <span>{formatDate(proposal.proposed_date)}</span>
        </div>

        {proposal.task_priority && (
          <div style={{ display: "flex", alignItems: "center", gap: spacing.xs }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: getPriorityColor(proposal.task_priority)
              }}
            />
            <span>{priorityLabels[proposal.task_priority]}</span>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: spacing.xs }}>
          <span>👤</span>
          <span>
            {isProposer ? "You proposed" : `Proposed by ${proposal.proposer_email || "Unknown"}`}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: spacing.xs }}>
          <span>🕐</span>
          <span>{formatTime(proposal.proposed_at)}</span>
        </div>
      </div>

      {/* Actions */}
      {canRespond && (
        <div style={{
          display: "flex",
          gap: spacing.xs,
          marginTop: spacing.sm,
          paddingTop: spacing.sm,
          borderTop: `1px solid ${resolvedColors.border.default}`
        }}>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onAccept(proposal.id)}
            disabled={disabled}
            style={{ flex: 1 }}
          >
            ✓ Accept
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDecline(proposal.id)}
            disabled={disabled}
            style={{ flex: 1 }}
          >
            × Decline
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onMove(proposal.id)}
            disabled={disabled}
            style={{ flex: 1 }}
          >
            → Move
          </Button>
        </div>
      )}

      {/* Info message for non-recipients */}
      {!canRespond && isRecipient && proposal.status !== "proposed" && (
        <div
          style={{
            marginTop: spacing.sm,
            padding: spacing.xs,
            borderRadius: theme.componentRadius.badge.default,
            background: resolvedColors.surface.subtle,
            fontSize: theme.typography.sizes.sm.fontSize,
            color: resolvedColors.text.secondary
          }}
        >
          You {proposal.status} this proposal
        </div>
      )}

      {isProposer && !isRecipient && (
        <div
          style={{
            marginTop: spacing.sm,
            padding: spacing.xs,
            borderRadius: theme.componentRadius.badge.default,
            background: resolvedColors.surface.subtle,
            fontSize: theme.typography.sizes.sm.fontSize,
            color: resolvedColors.text.secondary
          }}
        >
          Waiting for recipient response
        </div>
      )}
    </div>
  );
}
