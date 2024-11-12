import { NextResponse } from "next/server";
import { getSupabseClient } from "@/supaClient/index";

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "_");
}

export async function POST(req: Request) {
  const { teamName, ownerId, pin } = await req.json();
  const supabase = getSupabseClient();

  const teamSlug = generateSlug(teamName);

  const { error } = await supabase
    .from("teams")
    .insert([{ name: teamName, slug: teamSlug, pin, owner_id: ownerId }]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(
    { message: "Team created successfully", slug: teamSlug },
    { status: 200 }
  );
}

export async function GET(
  req: Request,
  { params }: { params: { teamSlug: string } }
) {
  const searchParams = new URL(req.url).searchParams;
  const pin = searchParams.get("pin");
  const userId = searchParams.get("userId");

  if (!params.teamSlug) {
    return NextResponse.json({ error: "Missing teamSlug" }, { status: 400 });
  }

  const supabase = getSupabseClient();
  const { data: teams, error: teamError } = await supabase
    .from("teams")
    .select("*")
    .eq("slug", params.teamSlug)
    .limit(1);

  if (teamError || !teams.length) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  const team = teams[0] as { id: string; pin: string; owner_id: string };

  const { data: members, error: memberError } = await supabase
    .from("team_members")
    .select("*")
    .eq("team_id", team.id)
    .eq("user_id", userId);

  if (memberError) {
    return NextResponse.json({ error: "Error checking team membership" }, { status: 500 });
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

  return NextResponse.json({ team, meetings, isOwner, isMember }, { status: 200 });
}