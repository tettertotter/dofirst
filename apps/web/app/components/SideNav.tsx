'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { spacing, radius, useTheme } from '@todaypool/design-system';

const links = [
  { href: '/today', label: 'Today' },
  { href: '/pool', label: 'Pool' },
  { href: '/people', label: 'People' },
  { href: '/settings', label: 'Settings' },
];

export function SideNav() {
  const pathname = usePathname();
  const { resolvedColors } = useTheme();

  return (
    <nav
      aria-label="Primary"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.xs,
        width: '220px',
        padding: spacing.lg,
        borderRight: `1px solid ${resolvedColors.border.subtle}`
      }}
    >
      {links.map((l) => {
        const active = pathname?.startsWith(l.href);
        return (
          <Link key={l.href} href={l.href} aria-current={active ? 'page' : undefined}>
            <div
              style={{
                padding: `${spacing.sm} ${spacing.md}`,
                borderRadius: radius.md,
                background: active ? resolvedColors.bg.secondary : 'transparent',
                fontWeight: active ? 600 : 500
              }}
            >
              {l.label}
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
