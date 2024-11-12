import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY!;
const serviceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!;

let supabaseClient: SupabaseClient | null = null;

export const getSupabseClient = () => {
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, serviceRoleKey);
  }
  return supabaseClient;
};
