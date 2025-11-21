'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSupabaseClient } from '../../../lib/supabase-client';
import { Spinner } from '@todaypool/design-system';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Initializing...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setStatus('Setting up authentication...');
        const supabase = getSupabaseClient();

        // Log URL for debugging
        console.log('Auth callback URL:', window.location.href);
        console.log('Search params:', Object.fromEntries(searchParams.entries()));
        console.log('Hash:', window.location.hash);

        // Check for error in URL (both query params and hash)
        const errorParam = searchParams.get('error') || new URLSearchParams(window.location.hash.substring(1)).get('error');
        const errorDescription = searchParams.get('error_description') || new URLSearchParams(window.location.hash.substring(1)).get('error_description');

        if (errorParam) {
          console.error('Auth error from URL:', errorParam, errorDescription);
          setError(errorDescription || errorParam);
          setTimeout(() => router.push('/'), 3000);
          return;
        }

        // Check for token in hash (magic link auth)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        console.log('Access token present:', !!accessToken);
        console.log('Refresh token present:', !!refreshToken);

        setStatus('Verifying session...');

        // Wait a moment for Supabase to process the URL
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Get the session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        console.log('Session retrieved:', !!session);
        console.log('Session error:', sessionError);

        if (sessionError) {
          console.error('Auth callback error:', sessionError);
          setError(sessionError.message);
          setTimeout(() => router.push('/'), 3000);
          return;
        }

        if (session) {
          setStatus('Login successful! Redirecting...');
          console.log('Logged in as:', session.user.email);
          // Successfully logged in, redirect to today page
          setTimeout(() => {
            router.push('/today');
          }, 500);
        } else {
          console.log('No session found, trying refresh...');
          setStatus('Establishing session...');

          // No session found, try refreshing
          const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();

          console.log('Refreshed session:', !!refreshedSession);
          console.log('Refresh error:', refreshError);

          if (refreshedSession) {
            setStatus('Login successful! Redirecting...');
            setTimeout(() => {
              router.push('/today');
            }, 500);
          } else {
            setError('Could not establish session. Please try logging in again.');
            setTimeout(() => router.push('/'), 3000);
          }
        }
      } catch (err: any) {
        console.error('Unexpected auth error:', err);
        setError(err.message || 'An unexpected error occurred');
        setTimeout(() => router.push('/'), 3000);
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      gap: '16px',
      padding: '24px'
    }}>
      {error ? (
        <>
          <div style={{ fontSize: '48px' }}>⚠️</div>
          <p style={{ fontSize: '16px', fontWeight: 600, color: '#d32f2f' }}>
            Authentication Error
          </p>
          <p style={{ fontSize: '14px', opacity: 0.7, textAlign: 'center', maxWidth: '400px' }}>
            {error}
          </p>
          <p style={{ fontSize: '12px', opacity: 0.5 }}>
            Redirecting to home...
          </p>
        </>
      ) : (
        <>
          <Spinner size="lg" />
          <p style={{ fontSize: '14px', opacity: 0.7 }}>{status}</p>
          <p style={{ fontSize: '12px', opacity: 0.5, textAlign: 'center', maxWidth: '400px' }}>
            Check your browser console if this takes too long
          </p>
        </>
      )}
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: '16px',
        padding: '24px'
      }}>
        <Spinner size="lg" />
        <p style={{ fontSize: '14px', opacity: 0.7 }}>Loading authentication...</p>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
