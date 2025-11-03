import { NextRequest, NextResponse } from "next/server";
// TODO: Implement nag logic. Select tasks in 'today' with no activity and send gentle reminder.
export async function GET(_req: NextRequest) {
  return NextResponse.json({ ok: true });
}
