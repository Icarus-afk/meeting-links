import { NextResponse } from "next/server";
import { getSupabseClient } from "@/supaClient/index";

export async function authenticate(req: Request) {
  const supabase = getSupabseClient();
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");

  if (!token) {
    console.log("No token found in request headers");
    return null;
  }


  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    console.log("Error fetching user:", error);
    return null;
  }

  return data.user;
}
