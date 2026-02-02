import Link from 'next/link';
import { requireProSession } from '@/lib/auth/session';
import { sql } from '@/lib/db';
import { logoutAction } from './login/actions';

export default async function AdminHome() {
  const session = await requireProSession();

  const sets = await sql<{
    id: string;
    patch: string;
    tier_mode: string;
    status: string;
    created_at: string;
  }>`
    select id, patch, tier_mode, status, created_at
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

          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm font-semibold">Your training sets</div>
            <Link
              href="/admin/sets/new"
              className="flex h-10 items-center justify-center rounded-xl bg-black px-4 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              New set
            </Link>
          </div>

          <div className="mt-4 grid gap-2">
            {sets.rows.length === 0 ? (
              <div className="text-sm text-zinc-600 dark:text-zinc-400">No sets yet.</div>
            ) : (
              sets.rows.map((s) => (
                <Link
                  key={s.id}
                  href={`/admin/sets/${encodeURIComponent(s.id)}`}
                  className="rounded-xl border border-zinc-200 bg-white p-4 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold">{s.id}</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">{s.status}</div>
                  </div>
                  <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    patch {s.patch} · {s.tier_mode} · {new Date(s.created_at).toLocaleString()}
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
