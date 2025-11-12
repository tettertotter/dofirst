'use client';
import React, { useState } from 'react';
import { Modal, Input, Button, useToast, spacing } from '@todaypool/design-system';
import { getSupabaseClient } from '../../lib/supabase-client';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

export function LoginModal({ open, onClose }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { showToast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email.trim()) {
      showToast({ variant: 'error', message: 'Please enter your email' });
      return;
    }

    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      setEmailSent(true);
      showToast({ variant: 'success', message: 'Check your email for the login link!' });
    } catch (error: any) {
      showToast({ variant: 'error', message: error.message || 'Failed to send login email' });
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setEmail('');
    setEmailSent(false);
    onClose();
  }

  return (
    <Modal open={open} onClose={handleClose} title="Log In" size="sm">
      {emailSent ? (
        <div style={{
          padding: spacing.lg,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: spacing.lg,
          minWidth: 320
        }}>
          <div style={{ fontSize: '48px', lineHeight: 1 }}>📧</div>
          <div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 600,
              margin: `0 0 ${spacing.sm}`,
              lineHeight: 1.3
            }}>
              Check your email
            </h3>
            <p style={{
              fontSize: '14px',
              opacity: 0.7,
              margin: 0,
              lineHeight: 1.5
            }}>
              We sent a magic link to <strong>{email}</strong>
            </p>
          </div>
          <Button onClick={handleClose}>Done</Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: spacing.lg,
          padding: spacing.lg,
          minWidth: 320
        }}>
          <div>
            <p style={{
              fontSize: '14px',
              opacity: 0.7,
              margin: `0 0 ${spacing.lg}`,
              lineHeight: 1.5
            }}>
              Enter your email to receive a magic link
            </p>
            <Input
              type="email"
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChange={(e: any) => setEmail(e.target.value)}
              autoFocus
              required
            />
          </div>
          <div style={{ display: 'flex', gap: spacing.sm, justifyContent: 'flex-end' }}>
            <Button type="button" variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Magic Link'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
