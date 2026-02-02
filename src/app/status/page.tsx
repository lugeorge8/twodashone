import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function StatusPage() {
  const res = await fetch('http://localhost:3000/api/status', { cache: 'no-store' }).catch(() => null);
  const data = res ? await res.json().catch(() => null) : null;

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 dark:bg-black dark:text-zinc-50">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-5 py-10">
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            ← Home
          </Link>
          <div className="text-sm text-zinc-500 dark:text-zinc-400">twodashone · Status</div>
        </header>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h1 className="text-xl font-semibold">Server status</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Useful for debugging Google Sheets/Calendar configuration.
          </p>

          <pre className="mt-4 overflow-auto rounded-xl bg-zinc-50 p-4 text-xs dark:bg-zinc-900">
            {JSON.stringify(data, null, 2)}
          </pre>
        </section>
      </main>
    </div>
  );
}
