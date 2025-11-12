'use client';
import React, { useState, useEffect } from 'react';
import { Button, Input, useTheme } from '@todaypool/design-system';
import { useIsMobile } from '@todaypool/design-system';
import { spacing } from '@todaypool/design-system';
import { SearchModal } from './SearchModal';
import { LoginModal } from './LoginModal';
import { getSupabaseClient } from '../../lib/supabase-client';

export function TopAppBar({ onOpenQuickAdd }: { onOpenQuickAdd: () => void }) {
  const isMobile = useIsMobile();
  const { isDark, resolvedColors } = useTheme();
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Check authentication status
  useEffect(() => {
    const supabase = getSupabaseClient();

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserEmail(session?.user?.email || null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Keyboard shortcut: Cmd/Ctrl+K to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  async function handleLogout() {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    setUserEmail(null);
  }

  return (
    <>
      <header
        style={{
          borderBottom: `1px solid ${resolvedColors.border.subtle}`,
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backdropFilter: 'blur(12px)',
          background: isDark ? 'rgba(10, 10, 10, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        }}
        role="banner"
      >
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '16px 48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: spacing.lg,
        }}>
          <div style={{ fontWeight: 700, fontSize: '18px' }}>TodayPool</div>

          {!isMobile ? (
            // Desktop: Clickable search input
            <div
              style={{ flex: 1, maxWidth: 480, cursor: 'pointer' }}
              aria-label="Quick search"
              onClick={() => setSearchModalOpen(true)}
            >
              <Input
                placeholder="Search tasks... (⌘K)"
                readOnly
                style={{ cursor: 'pointer' }}
              />
            </div>
          ) : (
            // Mobile: Search icon button
            <button
              onClick={() => setSearchModalOpen(true)}
              aria-label="Search tasks"
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                padding: spacing.sm,
                color: resolvedColors.text.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              🔍
            </button>
          )}

          {userEmail ? (
            // Logged in: Show account button
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing.sm,
              position: 'relative',
              zIndex: 10,
              flexShrink: 0
            }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleLogout}
                aria-label="Log out"
                style={{
                  fontSize: '13px',
                  padding: `${spacing.xs} ${spacing.sm}`,
                  maxWidth: isMobile ? '80px' : '200px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {isMobile ? '👤' : userEmail}
              </Button>
              <Button aria-label="Quick add task" onClick={onOpenQuickAdd}>+ Add</Button>
            </div>
          ) : (
            // Not logged in: Show login button
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing.sm,
              position: 'relative',
              zIndex: 10,
              flexShrink: 0
            }}>
              <Button
                variant="secondary"
                onClick={() => {
                  console.log('Login button clicked');
                  setLoginModalOpen(true);
                }}
                aria-label="Log in"
              >
                Log In
              </Button>
              <Button aria-label="Quick add task" onClick={onOpenQuickAdd}>+ Add</Button>
            </div>
          )}
        </div>
      </header>

      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
      <LoginModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </>
  );
}
