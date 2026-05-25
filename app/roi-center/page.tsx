import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { RoiCenter } from "@/components/roi/roi-center";
import { hasSupabaseEnv } from "@/lib/env";
import { createServerClient } from "@/lib/supabase/server";

export default async function RoiCenterPage() {
  if (!hasSupabaseEnv()) {
    redirect("/login");
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ count: leadsCount }, { count: tasksCount }] = await Promise.all([
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .or(`user_id.eq.${user.id},assigned_to.eq.${user.id}`)
      .is("deleted_at", null),
  ]);

  return (
    <AppShell badges={{ leads: leadsCount ?? 0, tasks: tasksCount ?? 0 }} userEmail={user.email ?? "מאמן"}>
      <RoiCenter />
    </AppShell>
  );
}
