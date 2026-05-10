export function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <p className="text-xs uppercase tracking-[0.3em] text-gold-soft">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold text-white">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm text-zinc-400">{description}</p>
    </div>
  );
}
