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
  const supabase = getSupabseClient();
  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("*")
    .eq("slug", params.teamSlug)
    .single();

  if (teamError || !team) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  const { data: meetings, error: meetingsError } = await supabase
    .from("meetings")
    .select("*")
    .eq("team_id", team.id as string);

  if (meetingsError) {
    return NextResponse.json(
      { error: "Error fetching meetings" },
      { status: 500 }
    );
  }

  const { data: links, error: linksError } = await supabase
    .from("links")
    .select("*")
    .in(
      "meeting_id",
      meetings.map((meeting) => meeting.id)
    );

  if (linksError) {
    return NextResponse.json(
      { error: "Error fetching links" },
      { status: 500 }
    );
  }

  const meetingsWithLinks = meetings.map((meeting) => ({
    ...meeting,
    links: links.filter((link) => link.meeting_id === meeting.id),
  }));

  return NextResponse.json(
    { team, meetings: meetingsWithLinks },
    { status: 200 }
  );
}
