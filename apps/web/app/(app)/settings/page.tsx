"use client";

import React, { useState, useEffect } from "react";
import { getSupabaseClient } from "../../../lib/supabase-client";
import { Card, CardContent, Spinner, useTheme, spacing, Button, Toggle, Divider } from "@todaypool/design-system";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { resolvedColors, theme, setTheme } = useTheme();

  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
  }, []);

  const handleSignOut = async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh'
      }}>
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: spacing.xl }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 700,
          color: resolvedColors.text.primary,
          margin: 0,
          marginBottom: spacing.xs
        }}>
          Settings
        </h1>
        <p style={{
          fontSize: '14px',
          color: resolvedColors.text.secondary,
          margin: 0
        }}>
          Manage your preferences and account
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
        <Card>
          <CardContent>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 600,
              color: resolvedColors.text.primary,
              margin: 0,
              marginBottom: spacing.md
            }}>
              Appearance
            </h3>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: resolvedColors.text.primary,
                  marginBottom: '4px'
                }}>
                  Dark Mode
                </div>
                <div style={{
                  fontSize: '13px',
                  color: resolvedColors.text.secondary
                }}>
                  Switch between light and dark themes
                </div>
              </div>
              <Toggle
                checked={theme === 'dark'}
                onChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 600,
              color: resolvedColors.text.primary,
              margin: 0,
              marginBottom: spacing.md
            }}>
              Account
            </h3>
            {user && (
              <div style={{ marginBottom: spacing.md }}>
                <div style={{
                  fontSize: '13px',
                  color: resolvedColors.text.secondary,
                  marginBottom: '4px'
                }}>
                  Email
                </div>
                <div style={{
                  fontSize: '14px',
                  color: resolvedColors.text.primary
                }}>
                  {user.email}
                </div>
              </div>
            )}
            <Divider />
            <div style={{ marginTop: spacing.md }}>
              <Button
                onClick={handleSignOut}
                variant="danger"
                fullWidth
              >
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
