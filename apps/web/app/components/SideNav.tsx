'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { spacing, radius } from '@todaypool/design-system';

const links = [
  { href: '/today', label: 'Today' },
  { href: '/pool', label: 'Pool' },
  { href: '/inbox', label: 'Inbox' },
  { href: '/people', label: 'People' },
  { href: '/settings', label: 'Settings' },
];

export function SideNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary" style={{ display: 'flex', flexDirection: 'column', gap: spacing.xs }}>
      {links.map((l) => {
        const active = pathname?.startsWith(l.href);
        return (
          <Link key={l.href} href={l.href} aria-current={active ? 'page' : undefined}>
            <div
              style={{
                padding: `${spacing.sm}px ${spacing.md}px`,
                borderRadius: radius.md,
                background: active ? 'rgba(0,0,0,0.06)' : 'transparent',
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
