'use client';
import React, { useState } from 'react';
import { Modal, Input, Button, VoiceInput, useToast } from '@todaypool/design-system';
import { spacing } from '@todaypool/design-system';

export function QuickAddSheet({ open, onClose, poolId }:{ open:boolean; onClose:()=>void; poolId?:string }) {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const { showToast } = useToast();

  function onVoice(text: string) {
    setTitle(prev => (prev ? prev + ' ' + text : text));
  }

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!title.trim()) { showToast({ variant: 'error', message: 'Enter a task' }); return; }
    setBusy(true);
    try {
      const res = await fetch('/api/tasks.quickAdd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poolId, title: title.trim(), description: notes || undefined, source: 'app' })
      });
      if (!res.ok) throw new Error('Failed');
      showToast({ variant: 'success', message: 'Added to pool' });
      setTitle(''); setNotes(''); onClose();
    } catch (e:any) {
      showToast({ variant: 'error', message: e.message || 'Could not add' });
    } finally { setBusy(false); }
  }

  return (
    <Modal open={open} onClose={onClose} title="Quick Add">
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: spacing.md, padding: spacing.md, minWidth: 320 }}>
        <Input
          label="Task"
          placeholder="Task (partial ok)"
          value={title}
          onChange={(e:any)=>setTitle(e.target.value)}
          autoFocus
          required
        />
        <Input
          label="Notes (optional)"
          placeholder="Add details..."
          value={notes}
          onChange={(e:any)=>setNotes(e.target.value)}
          multiline
        />
        <div style={{ display: 'flex', gap: spacing.sm, alignItems: 'center' }}>
          <VoiceInput onTranscript={onVoice} aria-label="Dictate task" />
          <div style={{ flex: 1 }} />
          <Button type="submit" disabled={busy} aria-label="Add task">Add</Button>
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </Modal>
  );
}
