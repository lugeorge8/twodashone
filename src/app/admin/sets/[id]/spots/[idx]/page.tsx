import Link from 'next/link';
import { requireProSession } from '@/lib/auth/session';
import { sql } from '@/lib/db';
import { generateSpotAugmentsAction, saveSpotAnswerAction } from './spot-actions';
import AugmentActionClient from './augment-action-client';

type Opt = {
  id?: 'a' | 'b' | 'c' | 'a1' | 'b1' | 'c1';
  name?: string;
  description?: string;
  tier?: string;
};

const FALLBACK_IDS = ['a', 'b', 'c', 'a1', 'b1', 'c1'] as const;

function normalizeOptions(raw: unknown): Array<Required<Pick<Opt, 'id' | 'name' | 'description' | 'tier'>>> {
  const arr = Array.isArray(raw) ? raw : [];
  return arr.slice(0, 6).map((o: any, i) => {
    const id = (o?.id ?? FALLBACK_IDS[i]) as any;
    return {
      id,
      name: String(o?.name ?? ''),
      description: String(o?.description ?? ''),
      tier: String(o?.tier ?? ''),
    };
  });
}

export default async function AdminSpotPage({ params }: { params: Promise<{ id: string; idx: string }> }) {
  const session = await requireProSession();
  const { id: setId, idx } = await params;
  const spotIdx = Number(idx);

  if (!Number.isFinite(spotIdx) || spotIdx < 1 || spotIdx > 20) {
    return <div className="min-h-screen bg-zinc-50 p-10">Invalid spot.</div>;
  }

  const setRes = await sql<{ id: string; patch: string; tier_mode: string; status: string }>`
    select id, patch, tier_mode, status
    from training_sets
    where id = ${setId} and pro_id = ${session.proId!}
    limit 1
  `;
  const set = setRes.rows[0];
  if (!set) return <div className="min-h-screen bg-zinc-50 p-10">Not found.</div>;

  const spotRes = await sql<{
    idx: number;
    stage: string;
    screenshot_url: string | null;
    augment_options: unknown;
    correct_pick_id: string | null;
    correct_action_type: string | null;
    correct_augment_note: string | null;
  }>`
    select idx, stage, screenshot_url, augment_options, correct_pick_id, correct_action_type, correct_augment_note
    from training_spots
    where set_id = ${setId} and idx = ${spotIdx}
    limit 1
  `;
  const spot = spotRes.rows[0];
  if (!spot) return <div className="min-h-screen bg-zinc-50 p-10">Spot not found.</div>;

  const options = normalizeOptions(spot.augment_options);
  const nextIdx = spotIdx < 20 ? spotIdx + 1 : null;

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 dark:bg-black dark:text-zinc-50">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-5 py-10">
        <header className="flex items-center justify-between">
          <Link
            href={`/admin/sets/${encodeURIComponent(setId)}`}
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            ← Set
          </Link>
          <div className="text-sm text-zinc-500 dark:text-zinc-400">Spot {spotIdx} / 20</div>
        </header>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h1 className="text-xl font-semibold">{set.id}</h1>
          <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            patch {set.patch} · {set.tier_mode} · {set.status}
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-sm font-semibold">Screenshot (stage 1-4)</h2>

          {spot.screenshot_url ? (
            <div className="mt-4 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
              {/* Use plain img to avoid Next Image remotePatterns config. */}
              <img src={spot.screenshot_url} alt={`Spot ${spotIdx} screenshot`} className="h-auto w-full" />
              <div className="flex items-center justify-between px-3 py-2 text-xs text-zinc-500 dark:text-zinc-400">
                <span>Preview</span>
                <a className="underline" href={spot.screenshot_url} target="_blank" rel="noreferrer">
                  Open
                </a>
              </div>
            </div>
          ) : (
            <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">No screenshot uploaded yet.</div>
          )}

          <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
            Screenshots are attached when the set is created (from the screenshot library). To change screenshots,
            upload more screenshots in <span className="font-mono">/admin/screenshots</span> and regenerate the set (or we can add a picker later).
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">Augments (A/B/C + hidden A1/B1/C1)</h2>

            <form action={generateSpotAugmentsAction}>
              <input type="hidden" name="setId" value={setId} />
              <input type="hidden" name="idx" value={spotIdx} />
              <button
                type="submit"
                disabled={!spot.screenshot_url}
                className="h-9 rounded-xl border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-900 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
              >
                Generate augments
              </button>
            </form>
          </div>

          {!spot.screenshot_url ? (
            <div className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
              Upload screenshot first to enable generation and answer selection.
            </div>
          ) : null}

          <form action={saveSpotAnswerAction} className="mt-6 grid gap-6">
            <input type="hidden" name="setId" value={setId} />
            <input type="hidden" name="idx" value={spotIdx} />

            <AugmentActionClient options={options as any} defaultCorrectPickId={spot.correct_pick_id} disabled={!spot.screenshot_url} />

            <label className="grid gap-1">
              <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Pro explanation (shown to users after this spot)
              </span>
              <textarea
                name="correctAugmentNote"
                defaultValue={spot.correct_augment_note ?? ''}
                rows={3}
                disabled={!spot.screenshot_url}
                className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950"
                placeholder="Why is this the best play?"
              />
            </label>

            <div className="flex items-center justify-between">
              <Link
                href={`/admin/sets/${encodeURIComponent(setId)}/spots/${Math.max(1, spotIdx - 1)}`}
                className="text-sm text-zinc-600 hover:underline dark:text-zinc-400"
              >
                ← Prev
              </Link>

              <div className="flex items-center gap-3">
                {nextIdx ? (
                  <Link
                    href={`/admin/sets/${encodeURIComponent(setId)}/spots/${nextIdx}`}
                    className="h-10 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
                  >
                    Next →
                  </Link>
                ) : null}

                <button
                  type="submit"
                  disabled={!spot.screenshot_url}
                  className="h-10 rounded-xl bg-black px-4 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                >
                  Save
                </button>
              </div>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
