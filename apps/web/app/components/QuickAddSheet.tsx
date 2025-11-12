'use client';
import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, VoiceInput, useToast, Textarea, Spinner, Select } from '@todaypool/design-system';
import { spacing } from '@todaypool/design-system';
import { getSupabaseClient } from '../../lib/supabase-client';

interface PriorityLabel {
  priority_number: number;
  label: string;
}

export function QuickAddSheet({ open, onClose, poolId }:{ open:boolean; onClose:()=>void; poolId?:string }) {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<string>('unsorted'); // Default to unsorted
  const [busy, setBusy] = useState(false);
  const [loadingPool, setLoadingPool] = useState(false);
  const [defaultPoolId, setDefaultPoolId] = useState<string | null>(poolId || null);
  const [priorityLabels, setPriorityLabels] = useState<Map<number, string>>(new Map([
    [1, 'Today'],
    [2, 'This Week']
  ]));
  const { showToast } = useToast();

  // Fetch or create default pool if none provided
  useEffect(() => {
    if (poolId) {
      setDefaultPoolId(poolId);
      fetchPriorityLabels(poolId);
      return;
    }

    if (!open) return;

    async function fetchOrCreateDefaultPool() {
      setLoadingPool(true);
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setLoadingPool(false);
        showToast({ variant: 'error', message: 'Please log in to add tasks' });
        onClose();
        return;
      }

      const { data: memberships } = await supabase
        .from("pool_members")
        .select("pool_id")
        .eq("user_id", session.user.id)
        .limit(1);

      if (memberships && memberships.length > 0) {
        const poolId = memberships[0].pool_id;
        setDefaultPoolId(poolId);
        await fetchPriorityLabels(poolId);
        setLoadingPool(false);
      } else {
        // No pool found - create a default one
        try {
          const res = await fetch('/api/pools.create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: 'My Tasks',
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            })
          });

          if (res.ok) {
            const data = await res.json();
            if (data?.pool?.id) {
              setDefaultPoolId(data.pool.id);
              await fetchPriorityLabels(data.pool.id);
              showToast({ variant: 'success', message: 'Welcome! Ready to add your first task.' });
              setLoadingPool(false);
            } else {
              showToast({ variant: 'error', message: 'Failed to set up your task pool' });
              setLoadingPool(false);
              onClose();
            }
          } else {
            showToast({ variant: 'error', message: 'Failed to set up your task pool' });
            setLoadingPool(false);
            onClose();
          }
        } catch (error) {
          showToast({ variant: 'error', message: 'Failed to set up your task pool' });
          setLoadingPool(false);
          onClose();
        }
      }
    }

    fetchOrCreateDefaultPool();
  }, [open, poolId]);

  async function fetchPriorityLabels(poolId: string) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("priority_labels")
      .select("priority_number, label")
      .eq("pool_id", poolId);

    if (!error && data) {
      const labelsMap = new Map<number, string>();
      (data as PriorityLabel[]).forEach(pl => {
        labelsMap.set(pl.priority_number, pl.label);
      });
      // Merge with defaults
      if (!labelsMap.has(1)) labelsMap.set(1, 'Today');
      if (!labelsMap.has(2)) labelsMap.set(2, 'This Week');
      setPriorityLabels(labelsMap);
    }
  }

  function onVoice(text: string) {
    setTitle(prev => (prev ? prev + ' ' + text : text));
  }

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!title.trim()) { showToast({ variant: 'error', message: 'Enter a task' }); return; }
    if (!defaultPoolId) {
      showToast({ variant: 'error', message: 'Setting up your pool, please wait...' });
      return;
    }
    setBusy(true);
    try {
      // Convert priority string to number or null
      const priorityNum = priority === 'unsorted' ? null : parseInt(priority, 10);

      console.log('[QuickAddSheet] Submitting task:', {
        poolId: defaultPoolId,
        title: title.trim(),
        description: notes || undefined,
        priority: priorityNum
      });

      const res = await fetch('/api/tasks.quickAdd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          poolId: defaultPoolId,
          title: title.trim(),
          description: notes || undefined,
          priority: priorityNum,
          source: 'app'
        })
      });

      console.log('[QuickAddSheet] Response status:', res.status);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('[QuickAddSheet] API error:', errorData);
        throw new Error(errorData.error || errorData.message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      console.log('[QuickAddSheet] Success:', data);

      showToast({ variant: 'success', message: 'Task added!' });
      setTitle('');
      setNotes('');
      setPriority('unsorted');

      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('task-added', { detail: { taskId: data.taskId } }));

      onClose();
    } catch (e:any) {
      console.error('[QuickAddSheet] Error:', e);
      showToast({ variant: 'error', message: e.message || 'Could not add task' });
    } finally { setBusy(false); }
  }

  // Build priority options
  const priorityOptions = [
    { value: '1', label: priorityLabels.get(1) || 'Today' },
    { value: '2', label: priorityLabels.get(2) || 'This Week' },
    { value: 'unsorted', label: 'Uncategorized' },
    { value: '3', label: priorityLabels.get(3) || 'Priority 3' },
    { value: '4', label: priorityLabels.get(4) || 'Priority 4' },
    { value: '5', label: priorityLabels.get(5) || 'Priority 5' },
  ];

  return (
    <Modal open={open} onClose={onClose} title="Quick Add">
      {loadingPool ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: spacing.md,
          padding: spacing.xl,
          minWidth: 320
        }}>
          <Spinner size="lg" />
          <p style={{ margin: 0, fontSize: '14px', color: 'rgba(0,0,0,0.6)' }}>
            Setting up your task pool...
          </p>
        </div>
      ) : (
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: spacing.md, padding: spacing.md, minWidth: 320 }}>
          <Input
            label="Task"
            placeholder="What do you need to do?"
            value={title}
            onChange={(e:any)=>setTitle(e.target.value)}
            autoFocus
            required
          />
          <Textarea
            label="Notes (optional)"
            placeholder="Add details..."
            value={notes}
            onChange={(e:any)=>setNotes(e.target.value)}
            minHeight={60}
            maxHeight={200}
          />
          <Select
            label="Priority"
            value={priority}
            onChange={(value:string)=>setPriority(value)}
            options={priorityOptions}
          />
          <div style={{ display: 'flex', gap: spacing.sm, alignItems: 'center' }}>
            <VoiceInput onTranscript={onVoice} aria-label="Dictate task" />
            <div style={{ flex: 1 }} />
            <Button type="submit" disabled={busy || !defaultPoolId} aria-label="Add task">
              {busy ? 'Adding...' : 'Add'}
            </Button>
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
