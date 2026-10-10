/** Shown while the home / category data is being fetched. */
export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-8 sm:px-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">লোড হচ্ছে…</span>
      <div className="skeleton h-56 w-full rounded-3xl" />
      {[0, 1].map((section) => (
        <div key={section} className="space-y-4">
          <div className="skeleton h-7 w-56" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((card) => (
              <div key={card} className="skeleton h-36 rounded-2xl" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
