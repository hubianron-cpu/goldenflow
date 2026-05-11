import { redirect } from "next/navigation";
import { SectionHeader } from "@/components/section-header";
import { StatusMessage } from "@/components/status-message";
import { TaskList } from "@/components/tasks/task-list";
import { hasSupabaseEnv } from "@/lib/env";
import { getUsers } from "@/lib/actions";
import { createServerClient } from "@/lib/supabase/server";

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  if (!hasSupabaseEnv()) {
    redirect("/login");
  }

  const params = await searchParams;
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: tasks, error: tasksError }, { data: leads, error: leadsError }, usersResult] = await Promise.all([
    supabase
      .from("tasks")
      .select("id, title, description, due_date, linked_lead_id, status, priority, assigned_to, is_automated, created_at, updated_at, completed_at, deleted_at")
      .or(`user_id.eq.${user.id},assigned_to.eq.${user.id}`)
      .is("deleted_at", null)
      .order("status", { ascending: true })
      .order("due_date", { ascending: true, nullsFirst: false }),
    supabase.from("leads").select("id, name:full_name, phone, value").eq("user_id", user.id).order("full_name"),
    getUsers(),
  ]);

  const currentUserFallback = {
    email: user.email ?? null,
    first_name: String(user.user_metadata?.first_name || "").trim() || null,
    id: user.id,
  };
  const assignees = usersResult.data?.some((row) => row.id === user.id)
    ? usersResult.data
    : [currentUserFallback, ...(usersResult.data ?? [])];
  const dataError = tasksError?.message || leadsError?.message || usersResult.error || undefined;

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Tasks"
        title="ניהול משימות"
        description="מערכת משימות יומית שמחברת פולואפים, לידים וסגירת עסקאות במקום אחד ברור."
      />
      <StatusMessage error={params.error || dataError} success={params.success} />
      <TaskList assignees={assignees} currentUserId={user.id} leads={leads} tasks={tasks} />
    </div>
  );
}
