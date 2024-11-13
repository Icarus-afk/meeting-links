import { NextResponse, NextRequest } from "next/server";
import { getSupabseClient } from "@/supaClient/index";
import { authenticate } from "@/middleware/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ teamSlug: string }> }
) {
  const { teamSlug } = await params;
  const supabase = getSupabseClient();

  const user = await authenticate(req);
  if (!user) {
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
  const { data: links, error: linksError } = await supabase
    .from("links")
    .select("*")
    .eq("team_id", team.id as string);

  if (linksError) {
    return NextResponse.json(
      { error: "Error fetching links" },
      { status: 500 }
    );
  }

  return NextResponse.json({ team, links }, { status: 200 });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ teamSlug: string }> }
) {
  const { teamSlug } = await params;
  const supabase = getSupabseClient();

  const user = await authenticate(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, description, url } = await req.json();

  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("*")
    .eq("slug", teamSlug)
    .single();

  if (teamError || !team) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  const { data: link, error: linkError } = await supabase
    .from("links")
    .insert([{ team_id: team.id, title, description, url }])
    .single();

  if (linkError) {
    console.error("Error creating link:", linkError);
    return NextResponse.json({ error: "Error creating link" }, { status: 500 });
  }

  return NextResponse.json({ link }, { status: 201 });
}
