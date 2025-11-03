'use client';
import React from 'react';
import { Button, Input } from '@todaypool/design-system';
import { useIsMobile } from '@todaypool/design-system';
import { spacing } from '@todaypool/design-system';

export function TopAppBar({ onOpenQuickAdd }: { onOpenQuickAdd: () => void }) {
  const isMobile = useIsMobile();
  return (
    <header
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: spacing.md, padding: `${spacing.md}px ${spacing.lg}px`,
        borderBottom: '1px solid rgba(0,0,0,0.06)', position: 'sticky', top: 0,
        backdropFilter: 'blur(6px)', background: 'rgba(255,255,255,0.85)'
      }}
      role="banner"
    >
      <div style={{ fontWeight: 700 }}>TodayPool</div>
      {!isMobile && (
        <div style={{ flex: 1, maxWidth: 480 }} aria-label="Quick search">
          <Input placeholder="Search (⌘/Ctrl+K)" />
        </div>
      )}
      <div><Button aria-label="Quick add task" onClick={onOpenQuickAdd}>+ Add</Button></div>
    </header>
  );
}
