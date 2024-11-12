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
  
  const user = await authenticate(req);
  if (!user){
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  console.log("User authenticated:", user);
  
  // Fetch team data
  const { data: team, error: teamError } = (await supabase
    .from("teams")
    .select("*")
    .eq("slug", teamSlug)
    .single()) as { data: { id: string; pin: string } | null; error: any };

  if (teamError || !team) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  // Check if the user has already requested to join the team
  const { data: existingRequest, error: existingRequestError } = await supabase
    .from("team_members")
    .select("*")
    .eq("team_id", team.id)
    .eq("user_id", userId)
    .single();

  if (existingRequestError && existingRequestError.code !== "PGRST116") {
    return NextResponse.json(
      { error: existingRequestError.message },
      { status: 500 }
    );
  }

  if (existingRequest) {
    return NextResponse.json(
      { error: "You have already applied to join this team" },
      { status: 400 }
    );
  }

  if (team.pin !== pin) {
    return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
  }

  const { error: joinRequestError } = await supabase
    .from("team_members")
    .insert([{ team_id: team.id, user_id: userId, status: "pending" }]);

  if (joinRequestError) {
    return NextResponse.json(
      { error: "Error creating join request" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      message:
        "Join request created successfully. Please wait for the owner to approve your request.",
    },
    { status: 200 }
  );
}
