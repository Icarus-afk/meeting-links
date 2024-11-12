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
  if (!user){
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
    
  const { data: teams, error: teamsError } = await supabase
    .from("teams")
    .select("id, name")
    .eq("owner_id", userId);

  if (teamsError) {
    return NextResponse.json({ error: teamsError.message }, { status: 500 });
  }

  const teamIds = teams.map((team) => team.id);

  const { data: pendingRequests, error: requestsError } = await supabase
    .from("team_members")
    .select("id, team_id, user_id, status")
    .in("team_id", teamIds)
    .eq("status", "pending");

  if (requestsError) {
    return NextResponse.json({ error: requestsError.message }, { status: 500 });
  }

  const pendingRequestsWithTeamName = pendingRequests.map((request) => {
    const team = teams.find((team) => team.id === request.team_id);
    return { ...request, team_name: team?.name };
  });

  return NextResponse.json(
    { pendingRequests: pendingRequestsWithTeamName },
    { status: 200 }
  );
}
