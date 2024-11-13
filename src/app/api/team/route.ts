import { NextResponse } from "next/server";
import { getSupabseClient } from "@/supaClient/index";
import { authenticate } from "@/middleware/auth";

export async function GET(req: Request) {
  const searchParams = new URL(req.url).searchParams;
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const supabase = getSupabseClient();

  const user = await authenticate(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: teamIdsData, error: teamIdsError } = await supabase
    .from("team_members")
    .select("team_id")
    .eq("user_id", userId)
    .eq("status", "approved");

  if (teamIdsError) {
    return NextResponse.json({ error: teamIdsError.message }, { status: 500 });
  }

  const teamIds = teamIdsData?.map((item) => item.team_id) ?? [];

  const { data: teams, error: teamsError } = await supabase
    .from("teams")
    .select("*")
    .or(`owner_id.eq.${userId},id.in.(${teamIds.join(",")})`);

  if (teamsError) {
    return NextResponse.json({ error: teamsError.message }, { status: 500 });
  }

  const { data: pinnedTeamsData, error: pinnedTeamsError } = await supabase
    .from("pinned_teams")
    .select("team_id, pinned")
    .eq("user_id", userId);

  if (pinnedTeamsError) {
    return NextResponse.json(
      { error: pinnedTeamsError.message },
      { status: 500 }
    );
  }

  const pinnedTeamsMap = new Map(
    pinnedTeamsData.map((item) => [item.team_id, item.pinned])
  );

  const teamsWithPinnedStatus = teams.map((team) => ({
    ...team,
    pinned: pinnedTeamsMap.get(team.id) || false,
  }));

  return NextResponse.json({ teams: teamsWithPinnedStatus }, { status: 200 });
}
