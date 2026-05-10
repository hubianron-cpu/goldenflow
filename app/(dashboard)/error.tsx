"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="panel mx-auto mt-10 max-w-xl p-6">
      <h2 className="text-xl font-semibold">משהו השתבש</h2>
      <p className="mt-2 text-sm leading-6 text-zinc-400">{error.message || "לא הצלחנו לטעון את הנתונים."}</p>
      <button type="button" onClick={reset} className="button-primary mt-5">
        נסו שוב
      </button>
    </div>
  );
}
