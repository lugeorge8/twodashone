import Link from 'next/link';
import { requireProSession } from '@/lib/auth/session';
import { sql } from '@/lib/db';
import { saveSpotAnswerAction, uploadSpotScreenshotAction } from './actions';

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
    correct_augment_note: string | null;
  }>`
    select idx, stage, screenshot_url, augment_options, correct_augment_name, correct_augment_note
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
          <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Pick the correct augment (pro answer) and optionally add a short explanation.
          </div>

          <div className="mt-4 grid gap-3">
            {spots.rows.map((s) => {
              const options = Array.isArray(s.augment_options) ? s.augment_options : [];
              return (
                <details
                  key={s.idx}
                  id={`spot-${s.idx}`}
                  className="rounded-xl border border-zinc-200 bg-white p-4 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <summary className="cursor-pointer font-semibold">
                    Spot {s.idx} · stage {s.stage} · correct: {s.correct_augment_name ?? '(unset)'}
                  </summary>

                  <div className="mt-4 grid gap-4">
                    <form action={uploadSpotScreenshotAction} className="grid gap-2">
                      <input type="hidden" name="setId" value={id} />
                      <input type="hidden" name="idx" value={s.idx} />

                      <div className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                        Screenshot (stage 1-4)
                      </div>

                      {s.screenshot_url ? (
                        <a
                          href={s.screenshot_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-zinc-600 underline dark:text-zinc-400"
                        >
                          Open current screenshot
                        </a>
                      ) : (
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">No screenshot uploaded yet.</div>
                      )}

                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <input
                          name="screenshotFile"
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="text-sm"
                        />
                        <button
                          type="submit"
                          className="h-10 rounded-xl bg-black px-4 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                        >
                          Upload
                        </button>
                      </div>

                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        Uses Vercel Blob. Files are served via unguessable URLs (not fully private).
                      </div>
                    </form>

                    <form action={saveSpotAnswerAction} className="grid gap-4">
                      <input type="hidden" name="setId" value={id} />
                      <input type="hidden" name="idx" value={s.idx} />

                      <label className="grid gap-1">
                        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                          Screenshot URL override (optional)
                        </span>
                        <input
                          name="screenshotUrl"
                          defaultValue={s.screenshot_url ?? ''}
                          className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                          placeholder="(leave as-is)"
                        />
                      </label>

                    <div className="grid gap-2">
                      {options.length === 0 ? (
                        <div className="text-sm text-zinc-600 dark:text-zinc-400">No augment options found.</div>
                      ) : (
                        options.map((a: any) => {
                          const name = String(a?.name ?? '');
                          const desc = String(a?.description ?? '');
                          const tier = String(a?.tier ?? '');
                          return (
                            <label
                              key={name}
                              className="flex gap-3 rounded-xl border border-zinc-200 bg-white p-3 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
                            >
                              <input
                                type="radio"
                                name="correctAugmentName"
                                value={name}
                                defaultChecked={s.correct_augment_name === name}
                              />
                              <div className="min-w-0">
                                <div className="flex items-center justify-between gap-3">
                                  <div className="font-semibold">{name}</div>
                                  <div className="text-xs text-zinc-500 dark:text-zinc-400">{tier}</div>
                                </div>
                                <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{desc}</div>
                              </div>
                            </label>
                          );
                        })
                      )}
                    </div>

                    <label className="grid gap-1">
                      <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                        Pro explanation (optional)
                      </span>
                      <textarea
                        name="correctAugmentNote"
                        defaultValue={s.correct_augment_note ?? ''}
                        rows={3}
                        className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                        placeholder="Why is this the best pick? e.g. 'Slam angle, tempo, preserves streak, matches opener…'"
                      />
                    </label>

                    <div className="flex items-center justify-end">
                      <button
                        type="submit"
                        className="h-10 rounded-xl bg-black px-4 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                  </div>
                </details>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
