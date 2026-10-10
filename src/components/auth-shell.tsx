import Link from "next/link";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <section className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-10 sm:py-14">
      <header className="space-y-2 text-center">
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        <p className="text-sm text-base-content/70">{subtitle}</p>
      </header>

      <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm sm:p-6">{children}</div>

      <div className="text-center text-sm text-base-content/70">{footer}</div>

      <Link href="/" className="text-center text-sm text-base-content/60 hover:text-primary">
        ← হোম পেজে ফিরে যান
      </Link>
    </section>
  );
}
