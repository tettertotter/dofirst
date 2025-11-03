import { NextRequest, NextResponse } from "next/server";
// TODO: Implement daily digest email logic using Resend, querying tasks in 'today' and pending suggestions.
export async function GET(_req: NextRequest) {
  return NextResponse.json({ ok: true });
}
