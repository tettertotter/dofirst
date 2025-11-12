'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { spacing, useTheme } from '@todaypool/design-system';

const links = [
  { href: '/today', label: 'Today' },
  { href: '/pool', label: 'Pool' },
  { href: '/people', label: 'People' },
  { href: '/settings', label: 'Settings' },
];

export function BottomNav({ onOpenQuickAdd }: { onOpenQuickAdd: () => void }) {
  const pathname = usePathname();
  const { theme, isDark, resolvedColors } = useTheme();

  // Split nav items: 2 on left, FAB in middle, 3 on right
  const leftLinks = links.slice(0, 2);
  const rightLinks = links.slice(2);

  return (
    <nav aria-label="Primary" style={{
      position: 'sticky',
      bottom: 0,
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: `${spacing.sm}px`,
      borderTop: `1px solid ${resolvedColors.border.subtle}`,
      background: isDark ? 'rgba(10, 10, 10, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(8px)',
    }}>
      {/* Left nav items */}
      {leftLinks.map(l => {
        const active = pathname?.startsWith(l.href);
        return (
          <Link key={l.href} href={l.href} aria-current={active ? 'page' : undefined}>
            <div style={{
              padding: spacing.xs,
              fontWeight: active ? 700 : 500,
              fontSize: '13px',
              color: active ? theme.colors.primary[500] : resolvedColors.text.secondary
            }}>
              {l.label}
            </div>
          </Link>
        );
      })}

      {/* FAB - Floating Action Button (Gmail style) */}
      <button
        onClick={onOpenQuickAdd}
        aria-label="Quick add task"
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: theme.colors.primary[500],
          color: 'white',
          border: 'none',
          fontSize: '32px',
          fontWeight: 300,
          cursor: 'pointer',
          boxShadow: isDark
            ? '0 4px 12px rgba(0, 0, 0, 0.4)'
            : '0 3px 10px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '-36px',
          marginBottom: '0',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          flexShrink: 0,
          position: 'relative',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = isDark
            ? '0 6px 12px rgba(0, 0, 0, 0.4)'
            : '0 4px 12px rgba(0, 0, 0, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = isDark
            ? '0 4px 8px rgba(0, 0, 0, 0.3)'
            : '0 2px 8px rgba(0, 0, 0, 0.15)';
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = 'scale(0.95)';
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        +
      </button>

      {/* Right nav items */}
      {rightLinks.map(l => {
        const active = pathname?.startsWith(l.href);
        return (
          <Link key={l.href} href={l.href} aria-current={active ? 'page' : undefined}>
            <div style={{
              padding: spacing.xs,
              fontWeight: active ? 700 : 500,
              fontSize: '13px',
              color: active ? theme.colors.primary[500] : resolvedColors.text.secondary
            }}>
              {l.label}
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
