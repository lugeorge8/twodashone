import Link from 'next/link';
import { requireProSession } from '@/lib/auth/session';
import { sql } from '@/lib/db';

export default async function AdminSetPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireProSession();
  const { id } = await params;

  const setRes = await sql<{
    id: string;
    patch: string;
    tier_mode: string;
    status: string;
    created_at: string;
  }>`
    select id, patch, tier_mode, status, created_at
    from training_sets
    where id = ${id} and pro_id = ${session.proId!}
    limit 1
  `;

  const set = setRes.rows[0];
  if (!set) return <div className="min-h-screen bg-zinc-50 p-10">Not found.</div>;

  const counts = await sql<{
    total: number;
    with_screenshot: number;
    with_answer: number;
  }>`
    select
      count(*)::int as total,
      sum(case when screenshot_url is not null and screenshot_url <> '' then 1 else 0 end)::int as with_screenshot,
      sum(case when correct_pick_id is not null and correct_pick_id <> '' then 1 else 0 end)::int as with_answer
    from training_spots
    where set_id = ${id}
  `;

  const c = counts.rows[0];

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 dark:bg-black dark:text-zinc-50">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-5 py-10">
        <header className="flex items-center justify-between">
          <Link
            href="/admin"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            ← Admin
          </Link>
          <div className="text-sm text-zinc-500 dark:text-zinc-400">{set.status}</div>
        </header>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h1 className="text-xl font-semibold">{set.id}</h1>
          <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            patch {set.patch} · {set.tier_mode} · created {new Date(set.created_at).toLocaleString()}
          </div>

          <div className="mt-4 grid gap-1 text-sm text-zinc-700 dark:text-zinc-300">
            <div>Screenshots: {c?.with_screenshot ?? 0} / {c?.total ?? 20}</div>
            <div>Answers: {c?.with_answer ?? 0} / {c?.total ?? 20}</div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm font-semibold">Edit spots</div>
            <Link
              href={`/admin/sets/${encodeURIComponent(id)}/spots/1`}
              className="flex h-10 items-center justify-center rounded-xl bg-black px-4 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Start spot 1 →
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
