import { type NextRequest } from "next/server";
import { getSupabseClient } from "@/supaClient";

export const revalidate = 10;

export async function GET(
  request: NextRequest,
  { params }: { params: { teamSlug: string } }
) {
  const searchParams = request.nextUrl.searchParams;
  const pin = searchParams.get("pin");
  if (!params.teamSlug) {
    throw new Error("Missing teamSlug");
  }
  if (!pin) {
    throw new Error("Missing pin");
  }
  const supabase = await getSupabseClient();
  const { data: teams, error: teamError } = await supabase
    .from("teams")
    .select("*")
    .eq("slug", params.teamSlug)
    .limit(1);

  if (teamError || teams[0]?.id === undefined) {
    return new Response(
      JSON.stringify({
        error: "Team not found",
      }),
      { status: 404 }
    );
  }

  if (teams[0].pin !== pin) {
    return new Response(
      JSON.stringify({
        error: "Invalid pin",
      }),
      { status: 401 }
    );
  }

  delete teams[0].pin;

  const team = teams[0] as {
    id: number;
    name: string;
    slug: string;
  };

  if (!team) {
    return new Response(
      JSON.stringify({
        error: "Team not found",
      }),
      { status: 404 }
    );
  }

  const { data: meetings, error } = await supabase
    .from("meeting_links")
    .select("*")
    .eq("team_id", team.id);

  if (error) {
    return new Response(
      JSON.stringify({
        error: "Error getting meetings",
      }),
      { status: 500 }
    );
  }
  return new Response(
    JSON.stringify({
      team,
      meetings,
    }),
    { status: 200 }
  );
}
