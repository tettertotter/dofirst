import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '../../../lib/supabase-server';

/**
 * POST /api/tasks.remindMe
 * Gmail-style "Remind Me" - temporarily hide task and bring it back at specified time
 *
 * Body: { taskId, remindAt, alarmEnabled }
 */

const RemindMeSchema = z.object({
  taskId: z.string().uuid(),
  remindAt: z.string().datetime(), // ISO 8601 timestamp
  alarmEnabled: z.boolean().optional().default(false)
});

export async function POST(req: NextRequest) {
  console.log('[tasks.remindMe] POST request received');
  try {
    const body = await req.json();
    console.log('[tasks.remindMe] Body:', body);

    const parsed = RemindMeSchema.safeParse(body);
    if (!parsed.success) {
      console.error('[tasks.remindMe] Validation error:', parsed.error.flatten());
      return NextResponse.json(
        { error: 'invalid_body', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { taskId, remindAt, alarmEnabled } = parsed.data;

    // Validate timestamp is in the future
    const remindDate = new Date(remindAt);
    const now = new Date();
    if (remindDate <= now) {
      return NextResponse.json(
        { error: 'invalid_timestamp', message: 'Reminder time must be in the future' },
        { status: 400 }
      );
    }

    // Get authenticated user
    const supabase = await createServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    console.log('[tasks.remindMe] Session user:', session?.user?.id || 'none');

    if (!session?.user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const user = session.user;

    // Get the task to verify access
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('id, pool_id, title, priority')
      .eq('id', taskId)
      .single();

    if (taskError || !task) {
      console.error('[tasks.remindMe] Task not found:', taskError?.message);
      return NextResponse.json(
        { error: 'task_not_found', message: 'Task not found or access denied' },
        { status: 404 }
      );
    }

    // Verify user is a member of the pool
    const { data: member, error: memberError } = await supabase
      .from('pool_members')
      .select('user_id')
      .eq('pool_id', task.pool_id)
      .eq('user_id', user.id)
      .single();

    if (memberError || !member) {
      console.error('[tasks.remindMe] User not authorized:', memberError?.message);
      return NextResponse.json(
        { error: 'forbidden', message: 'Not authorized to access this task' },
        { status: 403 }
      );
    }

    console.log(`[tasks.remindMe] Setting reminder for task ${taskId} at ${remindAt}, alarm: ${alarmEnabled}`);

    // Update task with remind_at and alarm_enabled
    // Also move to Uncategorized (priority = null) when reminded
    const { error: updateError } = await supabase
      .from('tasks')
      .update({
        remind_at: remindAt,
        alarm_enabled: alarmEnabled,
        priority: null, // Move to Uncategorized
        updated_at: now.toISOString()
      })
      .eq('id', taskId);

    if (updateError) {
      console.error('[tasks.remindMe] Update failed:', updateError);
      return NextResponse.json(
        { error: 'update_failed', message: updateError.message },
        { status: 500 }
      );
    }

    console.log('[tasks.remindMe] Reminder set successfully');

    return NextResponse.json({
      success: true,
      taskId,
      remindAt,
      alarmEnabled
    });

  } catch (e: any) {
    console.error('[tasks.remindMe] Error:', e);
    return NextResponse.json(
      { error: 'server_error', details: e?.message || String(e) },
      { status: 500 }
    );
  }
}
