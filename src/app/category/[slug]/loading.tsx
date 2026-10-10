/** Category list skeleton — shown while products are being fetched. */
export default function CategoryLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">লোড হচ্ছে…</span>
      <div className="skeleton h-24 w-full rounded-2xl" />
      <div className="flex justify-between">
        <div className="skeleton h-6 w-56" />
        <div className="skeleton h-8 w-56" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="skeleton h-36 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
