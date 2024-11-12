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

  const { data: teamIdsData, error: teamIdsError } = await supabase
    .from("team_members")
    .select("team_id")
    .eq("user_id", userId)
    .eq("status", "approved");  

  if (teamIdsError) {
    return NextResponse.json({ error: teamIdsError.message }, { status: 500 });
  }

  const teamIds = teamIdsData?.map((item) => item.team_id);

  const { data: teams, error } = await supabase
    .from("teams")
    .select("*")
    .or(`owner_id.eq.${userId},id.in.(${teamIds.join(",")})`);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ teams }, { status: 200 });
}
