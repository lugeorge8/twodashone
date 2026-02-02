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
  if (!set) {
    return (
      <div className="min-h-screen bg-zinc-50 p-10">Not found.</div>
    );
  }

  const spots = await sql<{
    idx: number;
    stage: string;
    screenshot_url: string | null;
    augment_options: unknown;
    correct_augment_name: string | null;
  }>`
    select idx, stage, screenshot_url, augment_options, correct_augment_name
    from training_spots
    where set_id = ${id}
    order by idx asc
  `;

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
          <div className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
            MVP admin view: spots are generated, screenshots + correct answers can be added next.
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-sm font-semibold">Spots (20)</h2>
          <div className="mt-4 grid gap-3">
            {spots.rows.map((s) => (
              <details
                key={s.idx}
                className="rounded-xl border border-zinc-200 bg-white p-4 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              >
                <summary className="cursor-pointer font-semibold">
                  Spot {s.idx} · stage {s.stage} · correct: {s.correct_augment_name ?? '(unset)'}
                </summary>
                <pre className="mt-3 overflow-auto rounded-xl bg-zinc-50 p-3 text-xs dark:bg-zinc-900">
                  {JSON.stringify(s.augment_options, null, 2)}
                </pre>
              </details>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
