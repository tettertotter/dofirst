'use client';
import React, { useState } from 'react';
import { Modal, Button, spacing, useToast, useIsMobile } from '@todaypool/design-system';

interface RemindMeModalProps {
  open: boolean;
  onClose: () => void;
  taskId: string;
  taskTitle: string;
}

export function RemindMeModal({ open, onClose, taskId, taskTitle }: RemindMeModalProps) {
  const [customDate, setCustomDate] = useState('');
  const [customTime, setCustomTime] = useState('');
  const [alarmEnabled, setAlarmEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const { showToast } = useToast();
  const isMobile = useIsMobile();

  // Helper to format date for display
  function formatDateTime(date: Date): string {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dateStr = date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    const timeStr = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

    return `${dateStr} at ${timeStr}`;
  }

  // Quick time options
  function getLaterToday(): Date {
    const d = new Date();
    d.setHours(18, 0, 0, 0); // 6:00 PM today
    if (d <= new Date()) {
      d.setDate(d.getDate() + 1); // If already past 6pm, do tomorrow 6pm
    }
    return d;
  }

  function getTomorrow(): Date {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(8, 0, 0, 0); // 8:00 AM tomorrow
    return d;
  }

  function getThisWeekend(): Date {
    const d = new Date();
    const day = d.getDay();
    const daysUntilSaturday = day === 0 ? 6 : (6 - day);
    d.setDate(d.getDate() + daysUntilSaturday);
    d.setHours(9, 0, 0, 0); // 9:00 AM Saturday
    return d;
  }

  function getNextWeek(): Date {
    const d = new Date();
    const day = d.getDay();
    const daysUntilMonday = day === 0 ? 1 : (8 - day);
    d.setDate(d.getDate() + daysUntilMonday);
    d.setHours(8, 0, 0, 0); // 8:00 AM next Monday
    return d;
  }

  async function handleRemind(remindAt: Date) {
    setBusy(true);
    try {
      console.log('[RemindMeModal] Setting reminder:', {
        taskId,
        remindAt: remindAt.toISOString(),
        alarmEnabled
      });

      const res = await fetch('/api/tasks.remindMe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          remindAt: remindAt.toISOString(),
          alarmEnabled
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('[RemindMeModal] API error:', errorData);
        throw new Error(errorData.message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      console.log('[RemindMeModal] Success:', data);

      showToast({
        variant: 'success',
        message: `Reminder set for ${formatDateTime(remindAt)}${alarmEnabled ? ' with alarm' : ''}`
      });

      // Dispatch event to notify pool page to refresh
      window.dispatchEvent(new CustomEvent('task-reminded'));

      onClose();
    } catch (e: any) {
      console.error('[RemindMeModal] Error:', e);
      showToast({ variant: 'error', message: e.message || 'Failed to set reminder' });
    } finally {
      setBusy(false);
    }
  }

  async function handleCustomRemind() {
    if (!customDate || !customTime) {
      showToast({ variant: 'error', message: 'Please select both date and time' });
      return;
    }

    // Combine date and time
    const remindAt = new Date(`${customDate}T${customTime}`);

    // Validate it's in the future
    if (remindAt <= new Date()) {
      showToast({ variant: 'error', message: 'Reminder time must be in the future' });
      return;
    }

    await handleRemind(remindAt);
  }

  return (
    <Modal open={open} onClose={onClose} title={`Remind me: ${taskTitle}`}>
      <div style={{
        padding: spacing.lg,
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.md,
        minWidth: isMobile ? '280px' : '400px'
      }}>
        {/* Quick options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
          <Button
            variant="secondary"
            onClick={() => handleRemind(getLaterToday())}
            disabled={busy}
            style={{ justifyContent: 'flex-start' }}
          >
            <span>Later today</span>
            <span style={{ marginLeft: 'auto', opacity: 0.6, fontSize: '13px' }}>6:00 PM</span>
          </Button>

          <Button
            variant="secondary"
            onClick={() => handleRemind(getTomorrow())}
            disabled={busy}
            style={{ justifyContent: 'flex-start' }}
          >
            <span>Tomorrow</span>
            <span style={{ marginLeft: 'auto', opacity: 0.6, fontSize: '13px' }}>8:00 AM</span>
          </Button>

          <Button
            variant="secondary"
            onClick={() => handleRemind(getThisWeekend())}
            disabled={busy}
            style={{ justifyContent: 'flex-start' }}
          >
            <span>This weekend</span>
            <span style={{ marginLeft: 'auto', opacity: 0.6, fontSize: '13px' }}>Sat 9:00 AM</span>
          </Button>

          <Button
            variant="secondary"
            onClick={() => handleRemind(getNextWeek())}
            disabled={busy}
            style={{ justifyContent: 'flex-start' }}
          >
            <span>Next week</span>
            <span style={{ marginLeft: 'auto', opacity: 0.6, fontSize: '13px' }}>Mon 8:00 AM</span>
          </Button>
        </div>

        {/* Divider */}
        <div style={{
          borderTop: '1px solid rgba(0,0,0,0.1)',
          margin: `${spacing.sm} 0`
        }} />

        {/* Custom date/time picker */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
          <label style={{ fontSize: '14px', fontWeight: 600 }}>Pick date & time</label>
          <div style={{ display: 'flex', gap: spacing.sm }}>
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              disabled={busy}
              style={{
                flex: 1,
                padding: spacing.sm,
                border: '1px solid rgba(0,0,0,0.2)',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
            <input
              type="time"
              value={customTime}
              onChange={(e) => setCustomTime(e.target.value)}
              disabled={busy}
              style={{
                flex: 1,
                padding: spacing.sm,
                border: '1px solid rgba(0,0,0,0.2)',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>
        </div>

        {/* Alarm checkbox (mobile only) */}
        {isMobile && (
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing.sm,
            fontSize: '14px',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={alarmEnabled}
              onChange={(e) => setAlarmEnabled(e.target.checked)}
              disabled={busy}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <span>Set alarm notification</span>
          </label>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: spacing.sm, justifyContent: 'flex-end', marginTop: spacing.sm }}>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={busy}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleCustomRemind}
            disabled={busy || !customDate || !customTime}
          >
            {busy ? 'Setting...' : 'Set Reminder'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
