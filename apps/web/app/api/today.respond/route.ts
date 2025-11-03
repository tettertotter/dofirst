import { NextRequest, NextResponse } from "next/server";
import { TodayRespondSchema } from "@todaypool/db/schemas";
import { createServerClient, getAuthUser } from "../../../lib/supabase-server";

/**
 * POST /api/today.respond
 * Responds to a today proposal: accept, decline, or move to another date.
 * Only the owner (proposed_for person) can respond.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = TodayRespondSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "invalid_body", details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { proposalId, action, newDate } = parsed.data;

    // Validate newDate if action is move
    if (action === "move") {
      if (!newDate) {
        return NextResponse.json(
          { error: "missing_new_date", message: "newDate is required when action is 'move'" },
          { status: 400 }
        );
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
        return NextResponse.json(
          { error: "invalid_date", message: "newDate must be in YYYY-MM-DD format" },
          { status: 400 }
        );
      }
    }

    // Get authenticated user
    const supabase = createServerClient();
    const user = await getAuthUser(supabase);

    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    // Get the proposal
    const { data: proposal, error: proposalError } = await supabase
      .from("today_proposals")
      .select("*, tasks(*)")
      .eq("id", proposalId)
      .single();

    if (proposalError || !proposal) {
      return NextResponse.json(
        { error: "proposal_not_found", message: "Proposal does not exist" },
        { status: 404 }
      );
    }

    // Verify user is the owner (proposed_for person)
    if (user.id !== proposal.proposed_for) {
      return NextResponse.json(
        { error: "forbidden", message: "Only the owner can respond to proposals" },
        { status: 403 }
      );
    }

    // Check if proposal is still in proposed status
    if (proposal.status !== "proposed") {
      return NextResponse.json(
        { error: "already_responded", message: `This proposal has already been ${proposal.status}` },
        { status: 400 }
      );
    }

    let updatedProposal;

    switch (action) {
      case "accept":
        // Mark proposal as accepted
        const { data: accepted, error: acceptError } = await supabase
          .from("today_proposals")
          .update({
            status: "accepted",
            updated_at: new Date().toISOString()
          })
          .eq("id", proposalId)
          .select()
          .single();

        if (acceptError) {
          console.error("Accept error:", acceptError);
          return NextResponse.json(
            { error: "accept_failed", message: acceptError.message },
            { status: 500 }
          );
        }

        updatedProposal = accepted;
        break;

      case "decline":
        // Mark proposal as declined
        const { data: declined, error: declineError } = await supabase
          .from("today_proposals")
          .update({
            status: "declined",
            updated_at: new Date().toISOString()
          })
          .eq("id", proposalId)
          .select()
          .single();

        if (declineError) {
          console.error("Decline error:", declineError);
          return NextResponse.json(
            { error: "decline_failed", message: declineError.message },
            { status: 500 }
          );
        }

        updatedProposal = declined;
        break;

      case "move":
        // Update the proposal date and mark as moved, then create a new proposed one
        const { data: moved, error: moveError } = await supabase
          .from("today_proposals")
          .update({
            status: "moved",
            updated_at: new Date().toISOString()
          })
          .eq("id", proposalId)
          .select()
          .single();

        if (moveError) {
          console.error("Move error:", moveError);
          return NextResponse.json(
            { error: "move_failed", message: moveError.message },
            { status: 500 }
          );
        }

        // Create a new proposal for the new date
        const { data: newProposal, error: newProposalError } = await supabase
          .from("today_proposals")
          .insert({
            pool_id: proposal.pool_id,
            proposed_for: proposal.proposed_for,
            proposed_by: proposal.proposed_by,
            task_id: proposal.task_id,
            date: newDate,
            status: "proposed"
          })
          .select()
          .single();

        if (newProposalError) {
          console.error("New proposal error:", newProposalError);
          return NextResponse.json(
            { error: "new_proposal_failed", message: newProposalError.message },
            { status: 500 }
          );
        }

        updatedProposal = newProposal;
        break;

      default:
        return NextResponse.json(
          { error: "invalid_action", message: "Action must be accept, decline, or move" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      action,
      proposal: {
        id: updatedProposal.id,
        task_id: updatedProposal.task_id,
        date: updatedProposal.date,
        status: updatedProposal.status,
        updated_at: updatedProposal.updated_at
      }
    });

  } catch (error) {
    console.error("Today respond error:", error);
    return NextResponse.json(
      { error: "internal_error", message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
