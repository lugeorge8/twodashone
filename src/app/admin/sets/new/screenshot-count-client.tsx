'use client';

import { useMemo, useState } from 'react';

type Mode = 'augment_2_1' | 'augment_3_2' | 'augment_4_2';

type Props = {
  initialPatch: string;
  initialMode: Mode;
  counts: Record<string, Partial<Record<Mode, number>>>; // patch -> mode -> count
};

export default function ScreenshotCountClient({ initialPatch, initialMode, counts }: Props) {
  const [patch, setPatch] = useState(initialPatch);
  const [mode, setMode] = useState<Mode>(initialMode);

  const count = counts?.[patch]?.[mode] ?? 0;

  const msg = useMemo(() => {
    if (count >= 50) return { tone: 'good', text: `Screenshots available: ${count} (great)` };
    if (count >= 20) return { tone: 'ok', text: `Screenshots available: ${count} (enough)` };
    return { tone: 'bad', text: `Screenshots available: ${count} (upload more)` };
  }, [count]);

  const cls =
    msg.tone === 'good'
      ? 'border-green-200 bg-green-50 text-green-900 dark:border-green-900/40 dark:bg-green-950/40 dark:text-green-100'
      : msg.tone === 'ok'
        ? 'border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200'
        : 'border-red-200 bg-red-50 text-red-900 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-100';

  return (
    <div className="grid gap-3">
      <div className={`rounded-xl border p-3 text-sm ${cls}`}>{msg.text}</div>

      {/* Hidden mirrors so createTrainingSetAction receives the right values even though the real controls are above/below. */}
      <input type="hidden" name="patch" value={patch} />
      <input type="hidden" name="mode" value={mode} />

      {/* Tiny inline controls (kept in sync with main form via onChange handlers below). */}
      <div className="grid grid-cols-2 gap-2">
        <label className="grid gap-1">
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Patch</span>
          <select
            value={patch}
            onChange={(e) => setPatch(e.target.value)}
            className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
          >
            {Array.from({ length: 10 }).map((_, i) => {
              const p = `16.${String(i + 1).padStart(2, '0')}`;
              return (
                <option key={p} value={p}>
                  {p}
                </option>
              );
            })}
          </select>
        </label>

        <label className="grid gap-1">
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Mode</span>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as Mode)}
            className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
          >
            <option value="augment_2_1">Augments (2-1)</option>
            <option value="augment_3_2">Augments (3-2)</option>
            <option value="augment_4_2">Augments (4-2)</option>
          </select>
        </label>
      </div>

      <div className="text-xs text-zinc-500 dark:text-zinc-400">
        This count is per patch + mode. Sets randomly attach 20 screenshots from this pool.
      </div>
    </div>
  );
}
