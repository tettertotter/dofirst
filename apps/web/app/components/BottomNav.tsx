'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { spacing } from '@todaypool/design-system';

const links = [
  { href: '/today', label: 'Today' },
  { href: '/pool', label: 'Pool' },
  { href: '/inbox', label: 'Inbox' },
  { href: '/people', label: 'People' },
  { href: '/settings', label: 'Settings' },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary" style={{
      position: 'sticky', bottom: 0, display: 'flex', justifyContent: 'space-around',
      padding: `${spacing.sm}px`, borderTop: '1px solid rgba(0,0,0,0.06)', background: 'white'
    }}>
      {links.map(l => {
        const active = pathname?.startsWith(l.href);
        return (
          <Link key={l.href} href={l.href} aria-current={active ? 'page' : undefined}>
            <div style={{ padding: spacing.xs, fontWeight: active ? 700 : 500 }}>{l.label}</div>
          </Link>
        );
      })}
    </nav>
  );
}
