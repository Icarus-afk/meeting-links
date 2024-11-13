import { NextResponse, NextRequest } from "next/server";
import { getSupabseClient } from "@/supaClient/index";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pin = searchParams.get("pin");
  const userId = searchParams.get("userId");
  const teamSlug = req.nextUrl.pathname.split("/").pop();

  if (!teamSlug) {
    return NextResponse.json({ error: "Missing teamSlug" }, { status: 400 });
  }

  const supabase = getSupabseClient();
  const { data: teams, error: teamError } = await supabase
    .from("teams")
    .select("*")
    .eq("slug", teamSlug)
    .limit(1);

  if (teamError || !teams.length) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  const team = teams[0] as { id: string; pin: string; owner_id: string };

  const { data: members, error: memberError } = await supabase
    .from("team_members")
    .select("*")
    .eq("team_id", team.id || "")
    .eq("user_id", userId || "");

  if (memberError) {
    return NextResponse.json(
      { error: "Error checking team membership" },
      { status: 500 }
    );
  }

  const isOwner = team.owner_id === userId;
  const isMember = members.length > 0;

  if (!isOwner && !isMember && (!pin || team.pin !== pin)) {
    return NextResponse.json({ error: "Invalid pin" }, { status: 401 });
  }

  const { data: meetings, error: meetingsError } = await supabase
    .from("meetings")
    .select("*")
    .eq("team_id", team.id);

  if (meetingsError) {
    return NextResponse.json(
      { error: "Error fetching meetings" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { team, meetings, isOwner, isMember },
    { status: 200 }
  );
}
