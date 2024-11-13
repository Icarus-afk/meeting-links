import { NextResponse, NextRequest } from "next/server";
import { getSupabseClient } from "@/supaClient/index";
import { authenticate } from "@/middleware/auth";


export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ teamSlug: string }> }
) {
  const { teamSlug } = await params;
  const { userId, pin } = await req.json();
  const supabase = getSupabseClient();

  const user = await authenticate(req);
  if (!user){
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("*")
    .eq("slug", teamSlug)
    .single();

  if (teamError || !team) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

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
