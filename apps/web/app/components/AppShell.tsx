'use client';
import React, { useState } from 'react';
import { useIsMobile } from '@todaypool/design-system';
import { spacing } from '@todaypool/design-system';
import { TopAppBar } from './TopAppBar';
import { SideNav } from './SideNav';
import { BottomNav } from './BottomNav';
import { QuickAddSheet } from './QuickAddSheet';

export function AppShell({ children }:{ children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <TopAppBar onOpenQuickAdd={() => setOpen(true)} />
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '220px 1fr', gap: isMobile ? 0 : spacing.lg, padding: isMobile ? spacing.sm : spacing.lg }}>
        {!isMobile && <SideNav />}
        <main role="main" style={{ minHeight: '60vh' }}>{children}</main>
      </div>
      {isMobile && <BottomNav />}
      <QuickAddSheet open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
