import { NextResponse } from "next/server";
import { getSupabseClient } from "@/supaClient/index";

export async function GET(req: Request) {
  const searchParams = new URL(req.url).searchParams;
  const query = searchParams.get("query");
  const userId = searchParams.get("userId");

  if (!query || !userId) {
    return NextResponse.json(
      { error: "Missing query or userId" },
      { status: 400 }
    );
  }

  const supabase = getSupabseClient();
  const { data: teams, error } = await supabase
    .from("teams")
    .select("*")
    .ilike("name", `%${query}%`);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const teamsWithMembership = await Promise.all(
    teams.map(async (team) => {
      const { data: membership, error: membershipError } = await supabase
        .from("team_members")
        .select("*")
        .eq("team_id", team.id as string)
        .eq("user_id", userId);

      const isOwner = team.owner_id === userId;
      const isMember = membership && membership.length > 0;

      return { ...team, isOwner, isMember };
    })
  );

  return NextResponse.json({ teams: teamsWithMembership }, { status: 200 });
}
