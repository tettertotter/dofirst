"use client";

import React, { useState, useEffect } from "react";
import { getSupabaseClient } from "../../../lib/supabase-client";
import { Card, Spinner, useTheme, spacing } from "@todaypool/design-system";

export default function PeoplePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { resolvedColors } = useTheme();

  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
  }, []);

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
          People
        </h1>
        <p style={{
          fontSize: '14px',
          color: resolvedColors.text.secondary,
          margin: 0
        }}>
          Manage your pool members and permissions
        </p>
      </div>

      <Card>
        <div style={{ padding: spacing.xl, textAlign: 'center' }}>
          <p style={{
            color: resolvedColors.text.secondary,
            marginBottom: spacing.lg
          }}>
            Pool member management coming soon.
          </p>
        </div>
      </Card>
    </div>
  );
}
