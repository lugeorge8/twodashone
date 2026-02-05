import Link from 'next/link';
import { requireProSession } from '@/lib/auth/session';
import { sql } from '@/lib/db';
import { logoutAction } from './login/actions';
import { deleteTrainingSetAction } from './actions';

export default async function AdminHome() {
  const session = await requireProSession();

  const sets = await sql<{
    id: string;
    title: string;
    patch: string;
    tier_mode: string;
    status: string;
    created_at: string;
  }>`
    select id, title, patch, tier_mode, status, created_at
    from training_sets
    where pro_id = ${session.proId!}
    order by created_at desc
    limit 50
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
          <form action={logoutAction}>
            <button className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">
              Logout
            </button>
          </form>
        </header>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h1 className="text-xl font-semibold">Admin</h1>
          <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Signed in as {session.displayName} ({session.email})
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm font-semibold">Your training sets</div>
            <div className="flex gap-2">
              <Link
                href="/admin/screenshots"
                className="flex h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
              >
                Upload screenshots
              </Link>
              <Link
                href="/admin/sets/new"
                className="flex h-10 items-center justify-center rounded-xl bg-black px-4 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                New set
              </Link>
            </div>
          </div>

          {sets.rows.length === 0 ? (
            <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">No sets yet.</div>
          ) : (
            (() => {
              const published = sets.rows.filter((s) => s.status === 'published');
              const inProgress = sets.rows.filter((s) => s.status !== 'published');

              const SetRow = (s: (typeof sets.rows)[number]) => (
                <div
                  key={s.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-4 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <Link
                    href={`/admin/sets/${encodeURIComponent(s.id)}`}
                    className="min-w-0 flex-1 hover:underline"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="truncate font-semibold">{s.title || s.id}</div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">{s.status}</div>
                    </div>
                    <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      patch {s.patch} · {s.tier_mode} · {new Date(s.created_at).toLocaleString()}
                    </div>
                  </Link>

                  <form action={deleteTrainingSetAction}>
                    <input type="hidden" name="setId" value={s.id} />
                    <button
                      type="submit"
                      className="rounded-lg border border-zinc-200 px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-900"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              );

              return (
                <div className="mt-4 grid gap-6">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                      In progress
                    </div>
                    <div className="mt-2 grid gap-2">{inProgress.map(SetRow)}</div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                      Published
                    </div>
                    <div className="mt-2 grid gap-2">
                      {published.length === 0 ? (
                        <div className="text-sm text-zinc-600 dark:text-zinc-400">No published sets yet.</div>
                      ) : (
                        published.map(SetRow)
                      )}
                    </div>
                  </div>
                </div>
              );
            })()
          )}
        </section>
      </main>
    </div>
  );
}
