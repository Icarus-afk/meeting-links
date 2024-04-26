"use server";

import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://jhyjleeuaarpruvotdnh.supabase.co";
const supabaseKey = process.env.SUPABASE_KEY;

let client: ReturnType<typeof createClient> | null = null;

export const getSupabseClient = async () => {
  if (!supabaseKey) {
    throw new Error("No SUPABASE_KEY found");
  }
  if (!client) {
    client = createClient(supabaseUrl, supabaseKey);
  }
  return client;
};
