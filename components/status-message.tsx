export function StatusMessage({
  error,
  success,
}: {
  error?: string;
  success?: string;
}) {
  if (!error && !success) {
    return null;
  }

  return (
    <div
      className={`mb-5 rounded-lg border px-4 py-3 text-sm leading-6 ${
        error
          ? "border-danger/30 bg-danger/10 text-red-200"
          : "border-gold/30 bg-gold/10 text-gold-soft"
      }`}
    >
      {error || success}
    </div>
  );
}
