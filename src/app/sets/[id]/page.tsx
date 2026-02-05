import Link from 'next/link';
import { sql } from '@/lib/db';
import SetPlayClient from './set-play-client';

export const dynamic = 'force-dynamic';

type Opt = { id?: string; name?: string; description?: string; tier?: string };

function normalizeOptions(raw: unknown): Array<Required<Pick<Opt, 'id' | 'name' | 'description' | 'tier'>>> {
  const arr = Array.isArray(raw) ? raw : [];
  return arr.slice(0, 6).map((o: any) => ({
    id: String(o?.id ?? ''),
    name: String(o?.name ?? ''),
    description: String(o?.description ?? ''),
    tier: String(o?.tier ?? ''),
  }));
}

export default async function SetPlayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const setRes = await sql<{ id: string; title: string; patch: string; tier_mode: string }>`
    select id, title, patch, tier_mode
    from training_sets
    where id = ${id} and status = 'published'
    limit 1
  `;
  const set = setRes.rows[0];
  if (!set) {
    return (
      <div className="min-h-screen bg-zinc-50 p-10">
        <Link href="/sets" className="underline">
          Back
        </Link>
        <div className="mt-4">Set not found (or not published).</div>
      </div>
    );
  }

  // Only include "complete" spots
  const spots = await sql<{
    idx: number;
    screenshot_url: string;
    augment_options: unknown;
    correct_pick_id: string;
    correct_action_type: string;
    correct_augment_note: string | null;
  }>`
    select idx, screenshot_url, augment_options, correct_pick_id, correct_action_type, correct_augment_note
    from training_spots
    where set_id = ${id}
      and screenshot_url is not null and screenshot_url <> ''
      and correct_pick_id is not null and correct_pick_id <> ''
    order by idx asc
  `;

  const playable = spots.rows.map((s) => ({
    idx: s.idx,
    screenshotUrl: s.screenshot_url,
    options: normalizeOptions(s.augment_options),
    correctPickId: s.correct_pick_id,
    correctActionType: s.correct_action_type,
    note: s.correct_augment_note,
  }));

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 dark:bg-black dark:text-zinc-50">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-5 py-10">
        <header className="flex items-center justify-between">
          <Link
            href="/sets"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            ← Sets
          </Link>
          <div className="text-sm text-zinc-500 dark:text-zinc-400">{set.title || set.id}</div>
        </header>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h1 className="text-xl font-semibold">{set.title || set.id}</h1>
          <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            patch {set.patch} · {set.tier_mode}
          </div>
          <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            Playable spots: {playable.length} / 20
          </div>
        </section>

        <SetPlayClient setId={set.id} spots={playable} />

        <footer className="pt-4 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
          Disclaimer: This is a training tool. “Best pick” reflects the pro’s answer for the
          spot and may not generalize.
        </footer>
      </main>
    </div>
  );
}
