import React, { useState } from 'react';
import { View } from 'react-native';
import { Modal, Input, Button, VoiceInput, useToast } from '@todaypool/design-system';
import { spacing } from '@todaypool/design-system';

export function QuickAddSheet({ open, onClose }:{ open:boolean; onClose:()=>void }) {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const { showToast } = useToast();

  function onVoice(text: string) { setTitle(prev => (prev ? prev + ' ' + text : text)); }

  async function submit() {
    if (!title.trim()) { showToast({ variant: 'error', message: 'Enter a task' }); return; }
    setBusy(true);
    try {
      await fetch('/api/tasks.quickAdd', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), description: notes || undefined, source: 'app' })
      });
      setTitle(''); setNotes(''); onClose(); showToast({ variant: 'success', message: 'Added' });
    } catch (e:any) {
      showToast({ variant: 'error', message: e.message || 'Could not add' });
    } finally { setBusy(false); }
  }

  return (
    <Modal open={open} onClose={onClose} ariaLabel="Quick add task (mobile)">
      <View style={{ gap: spacing.md, padding: spacing.md }}>
        <Input placeholder="Task (partial ok)" value={title} onChange={(e:any)=>setTitle(e.target.value)} autoFocus />
        <Input placeholder="Notes (optional)" value={notes} onChange={(e:any)=>setNotes(e.target.value)} />
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <VoiceInput onTranscript={onVoice} />
          <View style={{ flex: 1 }} />
          <Button onClick={submit} disabled={busy}>Add</Button>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
        </View>
      </View>
    </Modal>
  );
}
