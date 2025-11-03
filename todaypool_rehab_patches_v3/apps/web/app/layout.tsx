import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import { ThemeBridge } from "./providers/ThemeBridge";

export const metadata: Metadata = {
  title: "TodayPool",
  description: "Focus on what matters today — cross‑platform task pool",
  viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
  themeColor: "#667eea",
  applicationName: "TodayPool",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeBridge>{children}</ThemeBridge>
      </body>
    </html>
  );
}
