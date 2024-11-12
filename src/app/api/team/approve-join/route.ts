import { NextResponse } from "next/server";
import { getSupabseClient } from "@/supaClient/index";
import { authenticate } from "@/middleware/auth";


export async function POST(req: Request) {
  const { requestId, userId } = await req.json();
  const supabase = getSupabseClient();

  const user = await authenticate(req);
  if (!user){
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  console.log("User authenticated:", user);

  
  const { data: joinRequest, error: joinRequestError } = await supabase
    .from("team_members")
    .select("*")
    .eq("id", requestId)
    .single();

  if (joinRequestError || !joinRequest) {
    return NextResponse.json(
      { error: "Join request not found" },
      { status: 404 }
    );
  }

  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("*")
    .eq("id", joinRequest.team_id as string)
    .single();

  if (teamError || !team) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  if (team.owner_id !== userId) {
    return NextResponse.json(
      { error: "Only the owner can approve join requests" },
      { status: 403 }
    );
  }

  const { error: updateError } = await supabase
    .from("team_members")
    .update({ status: "approved" })
    .eq("id", requestId);

  if (updateError) {
    return NextResponse.json(
      { error: "Error approving join request" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { message: "Join request approved successfully" },
    { status: 200 }
  );
}
