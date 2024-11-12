import { NextResponse } from "next/server";
import { getSupabseClient } from "@/supaClient/index";
import { authenticate } from "@/middleware/auth";

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "_");
}

export async function POST(req: Request) {
  const { teamName, ownerId, pin } = await req.json();
  const supabase = getSupabseClient();

  const user = await authenticate(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
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
