import Link from 'next/link';
import { requireProSession } from '@/lib/auth/session';
import { createTrainingSetAction } from './actions';

export default async function NewTrainingSetPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireProSession();
  const sp = await searchParams;

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 dark:bg-black dark:text-zinc-50">
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-5 py-10">
        <header className="flex items-center justify-between">
          <Link
            href="/admin"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            ← Back
          </Link>
          <div className="text-sm text-zinc-500 dark:text-zinc-400">Create training set</div>
        </header>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h1 className="text-xl font-semibold">New set</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Generates 20 spots immediately (draft). Pros can later pick correct answers and publish.
          </p>

          {sp.error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-100">
              {sp.error === 'no-screenshots'
                ? 'No screenshots found for that patch (stage 1-4). Upload screenshots first.'
                : `Missing/invalid field: ${sp.error}`}
            </div>
          )}

          <form action={createTrainingSetAction} className="mt-6 grid gap-4">
            <label className="grid gap-1">
              <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Mode</span>
              <select
                name="mode"
                defaultValue="augment_2_1"
                className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              >
                <option value="augment_2_1">Augments (2-1)</option>
                <option value="augment_3_2">Augments (3-2)</option>
                <option value="augment_4_2">Augments (4-2)</option>
              </select>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                Separate training sets per stage.
              </div>
            </label>
            <label className="grid gap-1">
              <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Patch</span>
              <input
                name="patch"
                placeholder="16.03b"
                required
                className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Title suffix</span>
              <input
                name="titleSuffix"
                placeholder="e.g. Fast 8 vs roll, AP opener, etc."
                required
                className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              />
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                Full title becomes: <span className="font-mono">[name].patch[patch].[suffix]</span>
              </div>
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Tier mode</span>
              <select
                name="tierMode"
                defaultValue="mixed"
                className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              >
                <option value="mixed">Mixed (silver/gold/prismatic)</option>
                <option value="silver">Only Silver</option>
                <option value="gold">Only Gold</option>
                <option value="prismatic">Only Prismatic</option>
              </select>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                This controls which tier is used when generating the 6 augment options.
              </div>
            </label>

            <button
              type="submit"
              className="h-11 rounded-xl bg-black px-4 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Create set
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
