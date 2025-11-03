/**
 * Platform-agnostic notification adapter interfaces.
 * Implement per-platform modules that conform to these types.
 */

export type NotifAction = 'done' | 'snooze10' | 'snooze60' | 'tomorrowAM';

export interface NotificationPayload {
  taskId: string;
  title: string;
  body?: string;
  dueAt: string; // ISO
}

export interface NotificationAdapter {
  schedule(taskId: string, times: Date[], payload: NotificationPayload): Promise<void>;
  cancel(taskId: string): Promise<void>;
  handleAction(action: NotifAction, payload: NotificationPayload): Promise<void>;
}
