'use client';
import React from 'react';
import { ThemeProvider, ToastProvider } from '@todaypool/design-system';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider config={{ colorScheme: 'light', persistPreference: false }}>
      <ToastProvider>
        {children}
      </ToastProvider>
    </ThemeProvider>
  );
}
