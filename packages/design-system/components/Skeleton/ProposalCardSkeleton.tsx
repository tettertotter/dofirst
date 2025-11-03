/**
 * ProposalCardSkeleton Component
 *
 * Skeleton loading state for ProposalCard.
 * Matches the exact layout of the real ProposalCard for seamless loading UX.
 */

'use client';

import React from 'react';
import { Skeleton } from './Skeleton';
import { useTheme } from '../../theme';
import { useIsMobile } from '../../hooks/useMediaQuery';

export interface ProposalCardSkeletonProps {
  /**
   * Show action buttons
   * @default true
   */
  showActions?: boolean;
}

/**
 * ProposalCardSkeleton Component
 *
 * Research shows skeleton screens make apps feel ~40% faster
 * by providing visual structure during loading.
 */
export const ProposalCardSkeleton: React.FC<ProposalCardSkeletonProps> = ({
  showActions = true,
}) => {
  const { theme, isDark, resolvedColors } = useTheme();
  const isMobile = useIsMobile();

  // Card container styles (matches ProposalCard)
  const cardStyles: React.CSSProperties = {
    background: resolvedColors.bg.primary,
    border: `1px solid ${resolvedColors.border.default}`,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  };

  // Header section
  const headerStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  };

  // Meta info section
  const metaStyles: React.CSSProperties = {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
    marginBottom: 12,
  };

  // Actions section
  const actionsStyles: React.CSSProperties = {
    display: 'flex',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTop: `1px solid ${resolvedColors.border.default}`,
  };

  return (
    <div style={cardStyles}>
      {/* Header */}
      <div style={headerStyles}>
        <div style={{ flex: 1 }}>
          {/* Title */}
          <Skeleton width="60%" height="20px" style={{ marginBottom: 8 }} />
          {/* Description */}
          <Skeleton width="90%" height="16px" />
        </div>

        {/* Status Badge */}
        <Skeleton
          width="80px"
          height="28px"
          variant="rectangular"
          style={{ marginLeft: 12 }}
        />
      </div>

      {/* Meta Info */}
      <div style={metaStyles}>
        {/* Date */}
        <Skeleton width="80px" height="16px" />
        {/* Priority */}
        <Skeleton width="60px" height="16px" />
        {/* Proposer */}
        <Skeleton width={isMobile ? '100px' : '150px'} height="16px" />
        {/* Time */}
        <Skeleton width="60px" height="16px" />
      </div>

      {/* Actions */}
      {showActions && (
        <div style={actionsStyles}>
          <Skeleton
            variant="rectangular"
            height="36px"
            style={{ flex: 1, borderRadius: 8 }}
          />
          <Skeleton
            variant="rectangular"
            height="36px"
            style={{ flex: 1, borderRadius: 8 }}
          />
          <Skeleton
            variant="rectangular"
            height="36px"
            style={{ flex: 1, borderRadius: 8 }}
          />
        </div>
      )}
    </div>
  );
};

ProposalCardSkeleton.displayName = 'ProposalCardSkeleton';
