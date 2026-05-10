export function LoadingCard({ label = "טוען נתונים..." }: { label?: string }) {
  return (
    <div className="panel p-6">
      <div className="flex items-center gap-3 text-sm text-zinc-300">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-gold border-t-transparent" />
        {label}
      </div>
      <div className="mt-5 space-y-3">
        <div className="h-4 w-2/3 rounded bg-white/10" />
        <div className="h-4 w-1/2 rounded bg-white/10" />
        <div className="h-4 w-3/4 rounded bg-white/10" />
      </div>
    </div>
  );
}
