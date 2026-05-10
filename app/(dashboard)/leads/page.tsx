import { redirect } from "next/navigation";
import { LeadManager } from "@/components/leads/lead-manager";
import { SectionHeader } from "@/components/section-header";
import { hasSupabaseEnv } from "@/lib/env";

export default function LeadsPage() {
  if (!hasSupabaseEnv()) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Leads"
        title="ניהול לידים"
        description="הוספה מהירה, חיפוש, סינון ועדכון סטטוס בלחיצה אחת."
      />
      <LeadManager />
    </div>
  );
}
