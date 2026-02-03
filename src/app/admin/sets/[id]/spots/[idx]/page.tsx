import Link from 'next/link';
import { requireProSession } from '@/lib/auth/session';
import { sql } from '@/lib/db';
import {
  generateSpotAugmentsAction,
  saveSpotAnswerAction,
  uploadSpotScreenshotAction,
} from './spot-actions';

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

function labelForPickId(id: string) {
  if (id === 'a' || id === 'b' || id === 'c') return id.toUpperCase();
  if (id === 'a1') return 'A (after reroll)';
  if (id === 'b1') return 'B (after reroll)';
  if (id === 'c1') return 'C (after reroll)';
  return id;
}

export default async function AdminSpotPage({
  params,
}: {
  params: Promise<{ id: string; idx: string }>;
}) {
  const session = await requireProSession();
  const { id: setId, idx } = await params;
  const spotIdx = Number(idx);
  if (!Number.isFinite(spotIdx) || spotIdx < 1 || spotIdx > 20) {
    return <div className="min-h-screen bg-zinc-50 p-10">Invalid spot.</div>;
  }

  const setRes = await sql<{
    id: string;
    patch: string;
    tier_mode: string;
    status: string;
  }>`
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
  const visible = options.filter((o) => o.id === 'a' || o.id === 'b' || o.id === 'c');
  const hidden = options.filter((o) => o.id === 'a1' || o.id === 'b1' || o.id === 'c1');

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
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            Spot {spotIdx} / 20
          </div>
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
            <a
              href={spot.screenshot_url}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-sm underline text-zinc-700 dark:text-zinc-300"
            >
              Open current screenshot
            </a>
          ) : (
            <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">No screenshot uploaded yet.</div>
          )}

          <form action={uploadSpotScreenshotAction} className="mt-4 grid gap-3">
            <input type="hidden" name="setId" value={setId} />
            <input type="hidden" name="idx" value={spotIdx} />

            <input name="screenshotFile" type="file" accept="image/png,image/jpeg,image/webp" className="text-sm" />

            <button
              type="submit"
              className="h-10 rounded-xl bg-black px-4 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Upload screenshot
            </button>

            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              Stored on Vercel Blob as an unguessable URL (public).
            </div>
          </form>
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

            <div className="grid gap-2">
              <div className="text-xs text-zinc-500 dark:text-zinc-400">Visible (A/B/C)</div>
              {visible.map((o) => (
                <label
                  key={o.id + o.name}
                  className="flex gap-3 rounded-xl border border-zinc-200 bg-white p-3 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
                >
                  <input
                    type="radio"
                    name="correctPickRaw"
                    value={`${o.id}::${o.name}`}
                    defaultChecked={spot.correct_pick_id === o.id}
                    disabled={!spot.screenshot_url}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-semibold">{labelForPickId(o.id)} · {o.name}</div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">{o.tier}</div>
                    </div>
                    <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{o.description}</div>
                  </div>
                </label>
              ))}
            </div>

            <div className="grid gap-2">
              <div className="text-xs text-zinc-500 dark:text-zinc-400">Hidden (after reroll)</div>
              {hidden.map((o) => (
                <label
                  key={o.id + o.name}
                  className="flex gap-3 rounded-xl border border-zinc-200 bg-white p-3 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
                >
                  <input
                    type="radio"
                    name="correctPickRaw"
                    value={`${o.id}::${o.name}`}
                    defaultChecked={spot.correct_pick_id === o.id}
                    disabled={!spot.screenshot_url}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-semibold">{labelForPickId(o.id)} · {o.name}</div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">{o.tier}</div>
                    </div>
                    <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{o.description}</div>
                  </div>
                </label>
              ))}
            </div>

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
