'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Input, Spinner, useTheme, spacing, Badge } from '@todaypool/design-system';
import { getSupabaseClient } from '../../lib/supabase-client';

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: number | null;
  status: string;
  pool_id: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const { resolvedColors } = useTheme();

  // Fetch all tasks when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchAllTasks();
      setQuery('');
    }
  }, [isOpen]);

  const fetchAllTasks = async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        setLoading(false);
        return;
      }

      // Get user's pool memberships
      const { data: memberships } = await supabase
        .from('pool_members')
        .select('pool_id')
        .eq('user_id', session.user.id);

      if (!memberships || memberships.length === 0) {
        setAllTasks([]);
        setResults([]);
        setLoading(false);
        return;
      }

      const poolIds = memberships.map(m => m.pool_id);

      // Fetch all open tasks
      const { data, error } = await supabase
        .from('tasks')
        .select('id, title, description, priority, status, pool_id')
        .in('pool_id', poolIds)
        .neq('status', 'done')
        .neq('status', 'archived')
        .order('priority', { ascending: true, nullsLast: true })
        .order('created_at', { ascending: true });

      if (error) throw error;

      setAllTasks((data as Task[]) || []);
      setResults((data as Task[]) || []); // Show all initially
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter tasks based on query
  useEffect(() => {
    if (!query.trim()) {
      setResults(allTasks);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = allTasks.filter(task => {
      const titleMatch = task.title.toLowerCase().includes(lowerQuery);
      const descMatch = task.description?.toLowerCase().includes(lowerQuery);
      return titleMatch || descMatch;
    });

    setResults(filtered);
  }, [query, allTasks]);

  const getPriorityLabel = (priority: number | null): string => {
    if (priority === null) return 'Unsorted';
    if (priority === 1) return 'Today';
    if (priority === 2) return 'This Week';
    return `Priority ${priority}`;
  };

  const getPriorityColor = (priority: number | null): 'primary' | 'warning' | 'neutral' => {
    if (priority === 1) return 'primary';
    if (priority === 2) return 'warning';
    return 'neutral';
  };

  const handleTaskClick = (task: Task) => {
    // Navigate to the appropriate page based on priority
    if (task.priority === 1) {
      window.location.assign('/today');
    } else {
      window.location.assign('/pool');
    }
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      size="md"
      title="Search"
    >
      <Input
        placeholder="Type to search tasks..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus
        size="md"
      />

      <div style={{ marginTop: spacing.lg }}>
        {loading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            padding: spacing.xl,
            minHeight: '200px',
            alignItems: 'center'
          }}>
            <Spinner size="lg" />
          </div>
        ) : results.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: spacing.xl,
            color: resolvedColors.text.secondary,
            fontSize: '14px'
          }}>
            {query ? 'No tasks found matching your search' : 'No open tasks'}
          </div>
        ) : (
          <div style={{
            maxHeight: '400px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: spacing.sm
          }}>
            {results.map(task => (
              <button
                key={task.id}
                onClick={() => handleTaskClick(task)}
                style={{
                  padding: spacing.md,
                  borderRadius: '8px',
                  border: `1px solid ${resolvedColors.border.subtle}`,
                  background: resolvedColors.surface.default,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  width: '100%'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = resolvedColors.surface.secondary;
                  e.currentTarget.style.borderColor = resolvedColors.border.default;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = resolvedColors.surface.default;
                  e.currentTarget.style.borderColor = resolvedColors.border.subtle;
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: spacing.sm,
                  marginBottom: task.description ? spacing.xs : 0
                }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: resolvedColors.text.primary,
                    flex: 1,
                    lineHeight: 1.5
                  }}>
                    {task.title}
                  </div>
                  <Badge
                    variant={getPriorityColor(task.priority)}
                    size="sm"
                  >
                    {getPriorityLabel(task.priority)}
                  </Badge>
                </div>
                {task.description && (
                  <div style={{
                    fontSize: '13px',
                    color: resolvedColors.text.secondary,
                    lineHeight: 1.5,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {task.description}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{
        marginTop: spacing.md,
        paddingTop: spacing.md,
        borderTop: `1px solid ${resolvedColors.border.subtle}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '12px',
        color: resolvedColors.text.tertiary
      }}>
        <span>{results.length} result{results.length !== 1 ? 's' : ''}</span>
        <span>Press ESC to close</span>
      </div>
    </Modal>
  );
}
