import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '../../../lib/supabase-server';

/**
 * POST /api/tasks.unsnooze
 * Clear remind_at to bring task back immediately
 *
 * Body: { taskId }
 */

const UnsnoozeSchema = z.object({
  taskId: z.string().uuid()
});

export async function POST(req: NextRequest) {
  console.log('[tasks.unsnooze] POST request received');
  try {
    const body = await req.json();
    console.log('[tasks.unsnooze] Body:', body);

    const parsed = UnsnoozeSchema.safeParse(body);
    if (!parsed.success) {
      console.error('[tasks.unsnooze] Validation error:', parsed.error.flatten());
      return NextResponse.json(
        { error: 'invalid_body', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { taskId } = parsed.data;

    // Get authenticated user
    const supabase = await createServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    console.log('[tasks.unsnooze] Session user:', session?.user?.id || 'none');

    if (!session?.user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const user = session.user;

    // Get the task to verify access
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('id, pool_id')
      .eq('id', taskId)
      .single();

    if (taskError || !task) {
      console.error('[tasks.unsnooze] Task not found:', taskError?.message);
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
      console.error('[tasks.unsnooze] User not authorized:', memberError?.message);
      return NextResponse.json(
        { error: 'forbidden', message: 'Not authorized to access this task' },
        { status: 403 }
      );
    }

    console.log(`[tasks.unsnooze] Clearing reminder for task ${taskId}`);

    // Clear remind_at and alarm_enabled
    const { error: updateError } = await supabase
      .from('tasks')
      .update({
        remind_at: null,
        alarm_enabled: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId);

    if (updateError) {
      console.error('[tasks.unsnooze] Update failed:', updateError);
      return NextResponse.json(
        { error: 'update_failed', message: updateError.message },
        { status: 500 }
      );
    }

    console.log('[tasks.unsnooze] Task unsnoozed successfully');

    return NextResponse.json({
      success: true,
      taskId
    });

  } catch (e: any) {
    console.error('[tasks.unsnooze] Error:', e);
    return NextResponse.json(
      { error: 'server_error', details: e?.message || String(e) },
      { status: 500 }
    );
  }
}
