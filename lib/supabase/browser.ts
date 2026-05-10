"use client";

import { getSupabaseClient } from "@/lib/supabase/client";

export function createBrowserSupabaseClient() {
  return getSupabaseClient();
}
