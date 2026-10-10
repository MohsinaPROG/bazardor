export default function ProductLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">লোড হচ্ছে…</span>
      <div className="skeleton h-5 w-64" />
      <div className="skeleton h-40 w-full rounded-2xl" />
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton h-28 rounded-2xl" />
        ))}
      </div>
      <div className="skeleton h-64 w-full rounded-2xl" />
    </div>
  );
}
