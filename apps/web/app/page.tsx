"use client";
import React, { useState, useEffect } from "react";
import { getSupabaseClient } from "../lib/supabase-client";
import {
  Button,
  Card,
  CardContent,
  Input,
  Badge,
  Spinner,
  InputModal,
  useToast,
  useTheme,
  spacing,
} from "@todaypool/design-system";
import { QuickAddSchema } from "@todaypool/db/schemas";

// Parse inline tokens from task title (#tags, !priority)
function parseInline(input: string): { title: string; tags: string[]; priority?: number } {
  const tags: string[] = [];
  let priority: number | undefined = undefined;

  // Extract tags (#word) and priority (!1-5)
  let cleanTitle = input.replace(/#(\w+)/g, (_, tag) => {
    tags.push(tag);
    return '';
  }).replace(/!([1-5])/g, (_, p) => {
    priority = parseInt(p, 10);
    return '';
  });

  // Clean up extra spaces
  cleanTitle = cleanTitle.replace(/\s+/g, ' ').trim();

  return { title: cleanTitle, tags, priority };
}

export default function Home() {
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [poolId, setPoolId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState("");

  const { showToast } = useToast();
  const { resolvedColors } = useTheme();

  useEffect(() => {
    const supabase = getSupabaseClient();

    // Get current user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);

      if (session?.user) {
        // Get user's first pool
        supabase
          .from("pool_members")
          .select("pool_id")
          .eq("user_id", session.user.id)
          .limit(1)
          .single()
          .then(({ data }) => {
            if (data) setPoolId(data.pool_id);
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSignIn() {
    if (!email.trim()) {
      showToast({ message: "Please enter your email address", variant: "error" });
      return;
    }

    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: window.location.origin
      }
    });

    if (error) {
      showToast({ message: `Sign in error: ${error.message}`, variant: "error" });
    } else {
      showToast({ message: "Check your email for the magic link!", variant: "success" });
      setShowEmailModal(false);
      setEmail("");
    }
  }

  async function signOut() {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    setUser(null);
    setPoolId(null);
    showToast({ message: "Signed out successfully", variant: "success" });
  }

  async function quickAdd() {
    if (!poolId) {
      showToast({ message: "No pool found. Please create a pool first.", variant: "error" });
      return;
    }

    setSubmitting(true);

    try {
      // Parse inline tokens from title
      const parsed = parseInline(title);
      const tags = parsed.tags.length > 0 ? parsed.tags : undefined;

      const body = {
        poolId,
        title: parsed.title || title, // Use original if parsing removes everything
        priority: parsed.priority,
        tags
      };

      const validated = QuickAddSchema.safeParse(body);
      if (!validated.success) {
        throw new Error("Please enter a task title");
      }

      const res = await fetch("/api/tasks.quickAdd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated.data)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to create task");
      }

      setTitle("");
      showToast({ message: `Task added: ${data.task.title}`, variant: "success" });
    } catch (e: any) {
      showToast({ message: `Error: ${e.message}`, variant: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey && title.trim()) {
      e.preventDefault();
      quickAdd();
    }
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: resolvedColors.bg.primary
      }}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <>
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.lg,
        backgroundColor: resolvedColors.bg.primary
      }}>
        <div style={{
          width: '100%',
          maxWidth: '400px',
          textAlign: 'center'
        }}>
          {/* Logo/Title */}
          <div style={{
            marginBottom: spacing['2xl']
          }}>
            <h1 style={{
              fontSize: '36px',
              fontWeight: 700,
              color: resolvedColors.text.primary,
              margin: 0,
              marginBottom: spacing.xs,
              letterSpacing: '-0.02em'
            }}>
              DoFirst
            </h1>
            <p style={{
              fontSize: '15px',
              color: resolvedColors.text.secondary,
              margin: 0,
              fontWeight: 500
            }}>
              Focus on what matters today
            </p>
          </div>

          {/* Sign In Card */}
          <Card>
            <CardContent>
              <div style={{ padding: `${spacing.md} 0` }}>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: 600,
                  marginBottom: spacing.xs,
                  color: resolvedColors.text.primary
                }}>
                  Welcome
                </h2>
                <p style={{
                  marginBottom: spacing.lg,
                  color: resolvedColors.text.secondary,
                  fontSize: '14px',
                  lineHeight: '1.6'
                }}>
                  Sign in to access your tasks and stay productive
                </p>
                <Button
                  onClick={() => setShowEmailModal(true)}
                  variant="primary"
                  size="lg"
                  fullWidth
                >
                  Continue with Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <InputModal
        isOpen={showEmailModal}
        onClose={() => {
          setShowEmailModal(false);
          setEmail("");
        }}
        title="Sign In"
        description="Enter your email to receive a magic sign-in link"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onSubmit={handleSignIn}
        submitLabel="Send Magic Link"
        inputType="email"
      />
      </>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: resolvedColors.bg.primary,
      padding: `${spacing.lg} ${spacing.md}`
    }}>
      {/* Container */}
      <div style={{
        maxWidth: '640px',
        margin: '0 auto',
        paddingTop: spacing.xl
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: spacing['2xl']
        }}>
          <div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: 700,
              color: resolvedColors.text.primary,
              margin: 0,
              marginBottom: '4px',
              letterSpacing: '-0.02em'
            }}>
              DoFirst
            </h1>
            <p style={{
              fontSize: '14px',
              color: resolvedColors.text.secondary,
              margin: 0
            }}>
              Focus on what matters today
            </p>
          </div>
          <Button onClick={signOut} variant="ghost" size="sm">
            Sign Out
          </Button>
        </div>

        {/* Quick Add Section */}
        <div style={{ marginBottom: spacing.xl }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: 600,
            color: resolvedColors.text.primary,
            marginBottom: spacing.sm
          }}>
            Add a task
          </label>
          <div style={{
            display: 'flex',
            gap: spacing.sm
          }}>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="What needs to be done?"
              style={{ flex: 1 }}
              autoFocus
            />
            <Button
              onClick={quickAdd}
              disabled={submitting || !title.trim()}
              variant="primary"
              size="md"
            >
              {submitting ? <Spinner size="sm" /> : "Add"}
            </Button>
          </div>
          <div style={{
            marginTop: spacing.xs,
            fontSize: '13px',
            color: resolvedColors.text.tertiary
          }}>
            Try: "Buy groceries #personal !2" or press Enter to add
          </div>
        </div>

        {/* Tips Card */}
        <Card variant="outlined">
          <CardContent>
            <h3 style={{
              fontSize: '14px',
              fontWeight: 600,
              color: resolvedColors.text.primary,
              margin: 0,
              marginBottom: spacing.sm
            }}>
              Quick formatting
            </h3>
            <div style={{
              display: 'grid',
              gap: spacing.xs,
              fontSize: '14px',
              color: resolvedColors.text.secondary,
              lineHeight: '1.6'
            }}>
              <div>
                <Badge variant="secondary" size="sm">#tag</Badge>
                <span style={{ marginLeft: spacing.xs }}>Add tags to organize</span>
              </div>
              <div>
                <Badge variant="secondary" size="sm">!1-5</Badge>
                <span style={{ marginLeft: spacing.xs }}>Set priority (1 = highest)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
