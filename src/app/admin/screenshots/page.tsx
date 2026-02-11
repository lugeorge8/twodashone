import Link from 'next/link';
import { requireProSession } from '@/lib/auth/session';
import { sql } from '@/lib/db';
import UploadForm from './upload-form';

export const dynamic = 'force-dynamic';

export default async function AdminScreenshotsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  await requireProSession();
  const sp = await searchParams;

  const recent = await sql<{ patch: string; mode: string; stage: string; image_url: string; created_at: string }>`
    select patch, mode, stage, image_url, created_at
    from screenshots
    order by created_at desc
    limit 25
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
          <div className="text-sm text-zinc-500 dark:text-zinc-400">Screenshots</div>
        </header>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h1 className="text-xl font-semibold">Screenshot library</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Upload Stage 1-4 board state screenshots. New training sets will randomly attach 20 screenshots for the selected patch.
          </p>

          {sp.ok === '1' ? (
            <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-900 dark:border-green-900/40 dark:bg-green-950/40 dark:text-green-100">
              Uploaded.
            </div>
          ) : null}

          {sp.error ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-100">
              Error: {sp.error}
            </div>
          ) : null}

          <UploadForm />
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-sm font-semibold">Recent uploads</h2>
          <div className="mt-4 grid gap-2">
            {recent.rows.map((r, i) => (
              <a
                key={r.image_url + i}
                href={r.image_url}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-zinc-200 bg-white p-3 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{r.patch} · {r.mode} · {r.stage}</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">{new Date(r.created_at).toLocaleString()}</div>
                </div>
                <div className="mt-1 truncate text-xs text-zinc-600 dark:text-zinc-400">{r.image_url}</div>
              </a>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
