import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // TODO: create an alias row and instruct Mailgun route
  return NextResponse.json({ alias: "vkanetasks+abc123@inbound.dofirst.today" });
}
