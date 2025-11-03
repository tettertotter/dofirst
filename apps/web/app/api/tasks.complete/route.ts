import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient, getAuthUser } from '../../../lib/supabase-server';
import { createNotificationAdapter } from '@todaypool/notifications';
import { computeNextInstance, type RecurrenceRule } from '@todaypool/recurrence';
import { computeNextTimes, DEFAULT_CADENCE, type QuietHours, type Cadence } from '@todaypool/nagging';
import { createLogger } from '@todaypool/logging';
import { withRateLimit, RateLimits } from '@todaypool/rate-limit';

/**
 * POST /api/tasks.complete
 * Mark a task as complete and cancel all pending notifications
 *
 * Called by:
 * - User clicking "Done" in UI
 * - Notification action button "Done"
 * - Service worker handling notification actions
 */

const logger = createLogger({ component: 'Complete' });

const CompleteSchema = z.object({
  taskId: z.string().uuid()
});

async function handleComplete(req: NextRequest) {
  const requestId = (req as any).requestId || 'unknown';
  const requestLogger = logger.child({ requestId });

  try {
    const body = await req.json();
    const parsed = CompleteSchema.safeParse(body);

    if (!parsed.success) {
      requestLogger.warn('Invalid request body', {
        errors: JSON.stringify(parsed.error.errors)
      });
      return NextResponse.json(
        { error: 'invalid_body', details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { taskId } = parsed.data;

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
      .select('id, pool_id, title, description, priority, visibility, status, due_at, recurrence, snooze_cadence, created_by')
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
        { error: 'forbidden', message: 'Not authorized to complete tasks in this pool' },
        { status: 403 }
      );
    }

    taskLogger.info('Completing task', {
      poolId: task.pool_id,
      hasRecurrence: !!task.recurrence
    });

    const now = new Date();
    let nextInstanceId: string | null = null;

    // Check if task has recurrence - generate next instance
    if (task.recurrence) {
      try {
        const rule = task.recurrence as RecurrenceRule;
        const currentDue = task.due_at ? new Date(task.due_at) : now;

        // Compute next instance
        const nextInstance = computeNextInstance(rule, currentDue);

        if (nextInstance.shouldContinue) {
          // Create next instance of recurring task
          const { data: nextTask, error: createError } = await supabase
            .from('tasks')
            .insert({
              pool_id: task.pool_id,
              created_by: task.created_by,
              title: task.title,
              description: task.description,
              priority: task.priority,
              visibility: task.visibility,
              status: 'open',
              due_at: nextInstance.dueAt.toISOString(),
              recurrence: task.recurrence,
              snooze_cadence: task.snooze_cadence
            })
            .select('id')
            .single();

          if (createError) {
            taskLogger.error('Failed to create next instance', createError, {
              poolId: task.pool_id
            });
          } else {
            nextInstanceId = nextTask.id;
            taskLogger.info('Created next recurring instance', {
              nextInstanceId: nextTask.id,
              nextDueAt: nextInstance.dueAt.toISOString()
            });

            // Schedule nagging notifications for next instance
            try {
              const notifications = createNotificationAdapter();
              const hasPermission = await notifications.hasPermission();

              if (hasPermission) {
                // Get user's nagging preferences
                const { data: prefs } = await supabase.rpc('get_nagging_preferences', {
                  p_user_id: user.id
                });

                const quietHours = prefs?.[0]?.quiet_hours as QuietHours | null;
                const defaultCadence = prefs?.[0]?.default_cadence as Cadence | null;
                const naggingEnabled = prefs?.[0]?.enabled ?? true;

                if (naggingEnabled) {
                  const cadence = task.snooze_cadence ?? defaultCadence ?? DEFAULT_CADENCE;
                  const nagTimes = computeNextTimes(nextInstance.dueAt, now, quietHours, cadence, 3);

                  const futureTimes = nagTimes.filter(time => time > now);

                  if (futureTimes.length > 0) {
                    await notifications.schedule(nextTask.id, futureTimes, {
                      taskId: nextTask.id,
                      title: task.title,
                      body: `Recurring task`,
                      dueAt: nextInstance.dueAt.toISOString(),
                      priority: task.priority ?? 3,
                      poolId: task.pool_id,
                      userId: user.id
                    });

                    await supabase.rpc('update_nagging_state_after_notification', {
                      p_task_id: nextTask.id,
                      p_new_times: JSON.stringify(futureTimes.map(t => t.toISOString()))
                    });
                  }
                }
              }
            } catch (notifError) {
              taskLogger.error('Failed to schedule notifications for next instance',
                notifError instanceof Error ? notifError : new Error(String(notifError)),
                { nextInstanceId }
              );
            }
          }
        } else {
          taskLogger.info('Recurrence ended, no next instance created');
        }
      } catch (recurrenceError) {
        taskLogger.error('Error handling recurrence',
          recurrenceError instanceof Error ? recurrenceError : new Error(String(recurrenceError))
        );
        // Continue with completion even if recurrence fails
      }
    }

    // Mark task as completed
    const { error: updateError } = await supabase
      .from('tasks')
      .update({
        status: 'completed',
        completed_at: now.toISOString(),
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

    // Reset nagging state
    await supabase.rpc('reset_nagging_state', { p_task_id: taskId });

    // Cancel all pending notifications
    try {
      const notifications = createNotificationAdapter();
      await notifications.cancel(taskId);
      taskLogger.info('Cancelled notifications');
    } catch (notifError) {
      // Log error but don't fail the request
      taskLogger.error('Failed to cancel notifications',
        notifError instanceof Error ? notifError : new Error(String(notifError))
      );
    }

    taskLogger.info('Task completed successfully', {
      completedAt: now.toISOString(),
      hasNextInstance: !!nextInstanceId
    });

    return NextResponse.json({
      success: true,
      taskId: task.id,
      completedAt: now.toISOString(),
      nextInstanceId: nextInstanceId || undefined
    });

  } catch (error) {
    requestLogger.error('Unhandled error in complete endpoint',
      error instanceof Error ? error : new Error(String(error))
    );
    return NextResponse.json(
      { error: 'internal_error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// Apply rate limiting: 300 requests per minute (generous for notification-triggered completions)
export const POST = withRateLimit(RateLimits.GENEROUS)(handleComplete);
