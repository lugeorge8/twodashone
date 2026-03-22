'use client';

import { useMemo, useState } from 'react';
import { COMPONENTS, computeSlamOptions, type ComponentId } from '@/lib/items/recipes';

type Props = {
  defaultComponents?: ComponentId[];
  defaultCorrectActionType?: string | null;
  defaultCorrectPickId?: string | null;
  disabled?: boolean;
};

export default function ItemSlamActionClient({
  defaultComponents,
  defaultCorrectActionType,
  defaultCorrectPickId,
  disabled,
}: Props) {
  const [selected, setSelected] = useState<ComponentId[]>(defaultComponents ?? []);
  const slams = useMemo(() => computeSlamOptions(selected, 4), [selected]);

  const [action, setAction] = useState<'slam' | 'no_slam'>(() => {
    if (defaultCorrectActionType === 'slam') return 'slam';
    if (defaultCorrectActionType === 'no_slam') return 'no_slam';
    // If they had a pick id, default to slam.
    return defaultCorrectPickId ? 'slam' : 'no_slam';
  });

  const [pickId, setPickId] = useState<string>(() => defaultCorrectPickId ?? '');

  const correctPickRaw = useMemo(() => {
    if (action === 'no_slam') return 'no_slam::No slam';
    const picked = slams.find((s) => s.id === pickId) ?? null;
    if (!picked) return '';
    return `${picked.id}::${picked.name}`;
  }, [action, pickId, slams]);

  return (
    <div className="grid gap-3">
      {/* Saved into DB for the spot */}
      <input type="hidden" name="itemComponents" value={JSON.stringify(selected)} />

      {/* Shared with saveSpotAnswerAction */}
      <input type="hidden" name="correctPickRaw" value={correctPickRaw} />

      <div className="text-xs text-zinc-500 dark:text-zinc-400">
        Select 3–5 components. We auto-generate up to 4 slam options from TFT base-item recipes.
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {COMPONENTS.map((c) => {
          const on = selected.includes(c.id);
          return (
            <button
              key={c.id}
              type="button"
              disabled={disabled}
              onClick={() => {
                setSelected((prev) => (prev.includes(c.id) ? prev.filter((x) => x !== c.id) : [...prev, c.id]));
              }}
              className={
                'h-10 rounded-xl border px-3 text-xs font-semibold ' +
                (on
                  ? 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-black'
                  : 'border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900')
              }
            >
              {c.name}
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Generated slam options</div>
        <div className="mt-2 grid gap-2">
          {slams.length ? (
            slams.map((s) => (
              <label
                key={s.id}
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-left dark:border-zinc-800 dark:bg-zinc-900"
              >
                <input
                  type="radio"
                  name="slamPick"
                  disabled={disabled || action !== 'slam'}
                  checked={pickId === s.id}
                  onChange={() => setPickId(s.id)}
                />
                <div className="min-w-0">
                  <div className="font-semibold">{s.name}</div>
                  <div className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                    Recipe: {s.recipe[0]} + {s.recipe[1]}
                  </div>
                </div>
              </label>
            ))
          ) : (
            <div className="text-sm text-zinc-600 dark:text-zinc-400">No completed items from this component set (need valid pairs).</div>
          )}
        </div>
      </div>

      <div className="grid gap-2">
        <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Correct answer</div>
        <div className="grid gap-2">
          <label className="flex items-center gap-3">
            <input
              type="radio"
              name="slamAction"
              value="no_slam"
              disabled={disabled}
              checked={action === 'no_slam'}
              onChange={() => setAction('no_slam')}
            />
            <span className="text-sm">No slam</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="radio"
              name="slamAction"
              value="slam"
              disabled={disabled}
              checked={action === 'slam'}
              onChange={() => setAction('slam')}
            />
            <span className="text-sm">Slam an item</span>
          </label>
          {action === 'slam' && !slams.length ? (
            <div className="text-xs text-red-700 dark:text-red-300">No slam options available — adjust components first.</div>
          ) : null}
          {action === 'slam' && slams.length && !pickId ? (
            <div className="text-xs text-red-700 dark:text-red-300">Pick which item is the correct slam.</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
