import { LeadCaptureForm } from "@/components/lead-capture-form";

export default async function PublicLeadPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen max-w-xl items-center px-4 py-8">
      <section className="panel w-full p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-gold-soft">Coach CRM</p>
        <h1 className="mt-4 text-3xl font-semibold leading-tight">נשמח לחזור אליך</h1>
        <p className="mt-3 text-sm leading-7 text-zinc-400">
          השאירו שם וטלפון, והפרטים ייכנסו ישירות למערכת כדי שנוכל לחזור אליכם במהירות.
        </p>

        <div className="mt-6">
          <LeadCaptureForm source={params.source || "organic"} />
        </div>
      </section>
    </main>
  );
}
