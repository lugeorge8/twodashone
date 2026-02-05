import Link from 'next/link';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function SetsIndexPage() {
  const sets = await sql<{
    id: string;
    title: string;
    patch: string;
    tier_mode: string;
    published_at: string | null;
  }>`
    select id, title, patch, tier_mode, published_at
    from training_sets
    where status = 'published'
    order by published_at desc nulls last, id desc
    limit 100
  `;

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
          <div className="text-sm text-zinc-500 dark:text-zinc-400">Training sets</div>
        </header>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h1 className="text-xl font-semibold">Published training sets</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Only completed spots are playable (screenshot + augments + pro answer).
          </p>

          <div className="mt-6 grid gap-2">
            {sets.rows.length === 0 ? (
              <div className="text-sm text-zinc-600 dark:text-zinc-400">No published sets yet.</div>
            ) : (
              sets.rows.map((s) => (
                <Link
                  key={s.id}
                  href={`/sets/${encodeURIComponent(s.id)}`}
                  className="rounded-xl border border-zinc-200 bg-white p-4 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
                >
                  <div className="font-semibold">{s.title || s.id}</div>
                  <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    patch {s.patch} · {s.tier_mode}
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
