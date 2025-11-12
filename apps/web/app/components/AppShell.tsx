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
    <div className="app-shell" style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <TopAppBar onOpenQuickAdd={() => setOpen(true)} />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {!isMobile && <SideNav />}
        <main role="main" style={{ flex: 1, overflowY: 'auto' }}>{children}</main>
      </div>
      {isMobile && <BottomNav onOpenQuickAdd={() => setOpen(true)} />}
      <QuickAddSheet open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
