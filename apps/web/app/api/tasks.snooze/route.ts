import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient, getAuthUser } from '../../../lib/supabase-server';
import { createNotificationAdapter } from '@todaypool/notifications';
import { computeNextTimes, DEFAULT_CADENCE, type QuietHours, type Cadence } from '@todaypool/nagging';
import { createLogger } from '@todaypool/logging';
import { withRateLimit, RateLimits } from '@todaypool/rate-limit';

/**
 * POST /api/tasks.snooze
 * Snooze a task to a new due time and reschedule nagging notifications
 *
 * Supports:
 * - Quick snooze: +10m, +1h
 * - Preset snooze: tonight (9pm), tomorrow_am (9am)
 * - Custom snooze: any future timestamp
 *
 * Automatically reschedules next 3 nagging notifications based on new due time
 */

const logger = createLogger({ component: 'Snooze' });

const SnoozeSchema = z.object({
  taskId: z.string().uuid(),
  // Exactly one of these must be provided:
  minutes: z.number().int().min(1).max(10080).optional(), // 1 min to 1 week
  preset: z.enum(['tonight', 'tomorrow_am', 'tomorrow_pm', 'next_week']).optional(),
  timestamp: z.string().datetime().optional() // ISO 8601
}).refine(
  data => {
    // Exactly one field must be set
    const fields = [data.minutes, data.preset, data.timestamp].filter(Boolean);
    return fields.length === 1;
  },
  { message: 'Exactly one of minutes, preset, or timestamp must be provided' }
);

async function handleSnooze(req: NextRequest) {
  const requestId = (req as any).requestId || 'unknown';
  const requestLogger = logger.child({ requestId });

  try {
    const body = await req.json();
    const parsed = SnoozeSchema.safeParse(body);

    if (!parsed.success) {
      requestLogger.warn('Invalid request body', {
        errors: JSON.stringify(parsed.error.errors)
      });
      return NextResponse.json(
        { error: 'invalid_body', details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { taskId, minutes, preset, timestamp } = parsed.data;

    // Get authenticated user
    const supabase = createServerClient();
    const authHeader = req.headers.get('authorization');
    const user = await getAuthUser(supabase, authHeader);

    if (!user) {
      requestLogger.warn('Unauthorized request', { taskId });
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const taskLogger = requestLogger.child({ userId: user.id, taskId });

    // Get the task
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('id, pool_id, title, priority, due_at, snooze_cadence')
      .eq('id', taskId)
      .single();

    if (taskError || !task) {
      taskLogger.warn('Task not found or access denied', { error: taskError?.message });
      return NextResponse.json(
        { error: 'task_not_found', message: 'Task not found or access denied' },
        { status: 404 }
      );
    }

    // Verify user is a member of the pool
    const { data: member, error: memberError } = await supabase
      .from('pool_members')
      .select('role')
      .eq('pool_id', task.pool_id)
      .eq('user_id', user.id)
      .single();

    if (memberError || !member) {
      taskLogger.warn('User not authorized for pool', {
        poolId: task.pool_id,
        error: memberError?.message
      });
      return NextResponse.json(
        { error: 'forbidden', message: 'Not authorized to snooze tasks in this pool' },
        { status: 403 }
      );
    }

    // Calculate new due time
    const now = new Date();
    let newDue: Date;

    if (minutes) {
      // Quick snooze: add minutes to current time
      newDue = new Date(now.getTime() + minutes * 60 * 1000);
    } else if (preset) {
      // Preset snooze
      newDue = new Date(now);

      switch (preset) {
        case 'tonight':
          // Today at 9pm, or tomorrow 9pm if already past
          newDue.setHours(21, 0, 0, 0);
          if (newDue <= now) {
            newDue.setDate(newDue.getDate() + 1);
          }
          break;

        case 'tomorrow_am':
          // Tomorrow at 9am
          newDue.setDate(newDue.getDate() + 1);
          newDue.setHours(9, 0, 0, 0);
          break;

        case 'tomorrow_pm':
          // Tomorrow at 2pm
          newDue.setDate(newDue.getDate() + 1);
          newDue.setHours(14, 0, 0, 0);
          break;

        case 'next_week':
          // Same time next Monday
          const daysUntilMonday = (8 - newDue.getDay()) % 7 || 7;
          newDue.setDate(newDue.getDate() + daysUntilMonday);
          newDue.setHours(9, 0, 0, 0);
          break;
      }
    } else if (timestamp) {
      // Custom snooze: use provided timestamp
      newDue = new Date(timestamp);

      // Validate timestamp is in the future
      if (newDue <= now) {
        taskLogger.warn('Invalid snooze timestamp (not in future)', { timestamp });
        return NextResponse.json(
          { error: 'invalid_timestamp', message: 'Timestamp must be in the future' },
          { status: 400 }
        );
      }
    } else {
      // Should never happen due to Zod refinement
      taskLogger.error('No snooze parameter provided (schema validation bug)');
      return NextResponse.json(
        { error: 'invalid_body', message: 'No snooze parameter provided' },
        { status: 400 }
      );
    }

    taskLogger.info('Snoozing task', {
      snoozeType: minutes ? 'minutes' : preset ? 'preset' : 'custom',
      snoozeValue: minutes || preset || timestamp,
      newDueAt: newDue.toISOString(),
      poolId: task.pool_id
    });

    // Update task due_at
    const { error: updateError } = await supabase
      .from('tasks')
      .update({
        due_at: newDue.toISOString(),
        updated_at: now.toISOString()
      })
      .eq('id', taskId);

    if (updateError) {
      taskLogger.error('Task update failed', updateError);
      return NextResponse.json(
        { error: 'update_failed', message: updateError.message },
        { status: 500 }
      );
    }

    // Reset nagging state (start fresh cadence)
    await supabase.rpc('reset_nagging_state', { p_task_id: taskId });

    // Get user's nagging preferences
    const { data: prefs } = await supabase.rpc('get_nagging_preferences', {
      p_user_id: user.id
    });

    const quietHours = prefs?.[0]?.quiet_hours as QuietHours | null;
    const defaultCadence = prefs?.[0]?.default_cadence as Cadence | null;
    const naggingEnabled = prefs?.[0]?.enabled ?? true;

    // Schedule notifications if nagging is enabled
    if (naggingEnabled) {
      try {
        const notifications = createNotificationAdapter();
        const hasPermission = await notifications.hasPermission();

        if (hasPermission) {
          // Compute next 3 nagging times
          const cadence = task.snooze_cadence ?? defaultCadence ?? DEFAULT_CADENCE;
          const nagTimes = computeNextTimes(
            newDue,
            now,
            quietHours,
            cadence,
            3
          );

          // Cancel existing notifications
          await notifications.cancel(taskId);

          // Schedule new notifications
          const notificationPayload = {
            taskId: task.id,
            title: task.title,
            body: `Snoozed until ${newDue.toLocaleTimeString()}`,
            dueAt: newDue.toISOString(),
            priority: task.priority ?? 3,
            poolId: task.pool_id,
            userId: user.id
          };

          await notifications.schedule(taskId, nagTimes, notificationPayload);

          // Update nagging state with new schedule
          await supabase.rpc('update_nagging_state_after_notification', {
            p_task_id: taskId,
            p_new_times: JSON.stringify(nagTimes.map(t => t.toISOString()))
          });

          taskLogger.info('Rescheduled notifications', {
            scheduledTimes: nagTimes.map(t => t.toISOString())
          });
        }
      } catch (notifError) {
        // Log error but don't fail the request
        taskLogger.error('Failed to schedule notifications',
          notifError instanceof Error ? notifError : new Error(String(notifError))
        );
      }
    }

    taskLogger.info('Task snoozed successfully', {
      newDueAt: newDue.toISOString(),
      snoozedBy: minutes ? `${minutes}m` : preset ?? 'custom'
    });

    return NextResponse.json({
      success: true,
      newDueAt: newDue.toISOString(),
      snoozedBy: minutes ? `${minutes}m` : preset ?? 'custom'
    });

  } catch (error) {
    requestLogger.error('Unhandled error in snooze endpoint',
      error instanceof Error ? error : new Error(String(error))
    );
    return NextResponse.json(
      { error: 'internal_error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// Apply rate limiting: 300 requests per minute (generous for notification-triggered snoozes)
export const POST = withRateLimit(RateLimits.GENEROUS)(handleSnooze);
