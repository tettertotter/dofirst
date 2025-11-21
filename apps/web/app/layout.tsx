import type { Metadata } from "next";
import "./globals.css";
import React from "react";

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#667eea',
};

export const metadata: Metadata = {
  title: "TodayPool",
  description: "Focus on what matters today — cross‑platform task pool",
  applicationName: "TodayPool",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
