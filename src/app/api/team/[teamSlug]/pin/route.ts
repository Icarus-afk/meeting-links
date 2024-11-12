import { NextResponse } from "next/server";
import { getSupabseClient } from "@/supaClient/index";
import { authenticate } from "@/middleware/auth";

export async function POST(
  req: Request,
  context: { params: { teamSlug: string } }
) {
  const { teamSlug } = await context.params;
  const { userId, pin } = await req.json();
  const supabase = getSupabseClient();

  // Authenticate the user
  const user = await authenticate(req);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  console.log("User authenticated:", user);

  // Fetch team data
  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("*")
    .eq("slug", teamSlug)
    .single();

  if (teamError || !team) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  console.log("Team found:", team);

  // Update pinned status
  const { error: pinError } = await supabase
    .from("pinned_teams")
    .upsert({ user_id: userId, team_id: team.id, pinned: pin });

  if (pinError) {
    return NextResponse.json(
      { error: "Error updating pinned status" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { message: "Pinned status updated" },
    { status: 200 }
  );
}
