'use client';
import React from 'react';
import { ThemeProvider, ToastProvider, InstallPrompt } from '@todaypool/design-system';
import { AppShell } from '../components/AppShell';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AppShell>{children}</AppShell>
        <InstallPrompt />
      </ToastProvider>
    </ThemeProvider>
  );
}
