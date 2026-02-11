'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

type Opt = { id: string; name: string; description: string; tier: string };

type Spot = {
  idx: number;
  screenshotUrl: string;
  options: Opt[];
  correctPickId: string; // 'a'|'b'|'c'|'a1'|'b1'|'c1'
  correctActionType: string; // 'pick'|'reroll_then_pick'
  note: string | null;
};

type ChoiceState =
  | { kind: 'picked'; chosenId: string }
  | { kind: 'auto_lose_reroll'; base: 'a' | 'b' | 'c'; proPickId: string };

export default function SetPlayClient({
  setId,
  spots,
}: {
  setId: string;
  spots: Spot[];
}) {
  const playable = useMemo(() => spots ?? [], [spots]);

  const [i, setI] = useState(0);
  const [choice, setChoice] = useState<ChoiceState | null>(null);
  const [rerolled, setRerolled] = useState({ a: false, b: false, c: false });
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const spot = playable[i];
  const isDone = i >= playable.length;

  function restart() {
    setChoice(null);
    setRerolled({ a: false, b: false, c: false });
    setScore({ correct: 0, total: 0 });
    setI(0);
  }

  function next() {
    // If the user just answered, score it once.
    if (choice) {
      const gotItRight =
        choice.kind === 'picked' ? choice.chosenId === spot.correctPickId : false;
      setScore((s) => ({
        correct: s.correct + (gotItRight ? 1 : 0),
        total: s.total + 1,
      }));
    }

    setChoice(null);
    setRerolled({ a: false, b: false, c: false });
    setI((v) => v + 1);
  }

  if (playable.length === 0) {
    return (
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-xl font-semibold">No playable spots yet</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          This set is published, but no spots are complete (need screenshot + augments + pro answer).
        </p>
        <div className="mt-6">
          <Link href="/sets" className="underline">
            Back to sets
          </Link>
        </div>
      </section>
    );
  }

  if (isDone) {
    return (
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-xl font-semibold">Done.</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Score: <span className="font-semibold">{score.correct}</span> / {score.total} correct.
        </p>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          You finished {playable.length} spots in {setId}.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={restart}
            className="h-11 rounded-xl bg-black px-4 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Restart
          </button>
          <Link
            href="/sets"
            className="flex h-11 items-center justify-center rounded-xl border border-zinc-200 px-4 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            Back to sets
          </Link>
        </div>
      </section>
    );
  }

  const byId = new Map<string, Opt>();
  for (const o of spot.options) byId.set(o.id, o);

  const hasA1 = byId.has('a1');
  const hasB1 = byId.has('b1');
  const hasC1 = byId.has('c1');

  const proPickId = spot.correctPickId;
  const proBase = (proPickId?.[0] ?? '') as 'a' | 'b' | 'c';
  const proAction = spot.correctActionType;

  const rerolledMessage = {
    id: 'rerolled-message',
    name: 'You rerolled the pro pick — instant loss.',
    description: 'Same rule as MVP: rerolling the pro-selected augment is always wrong.',
    tier: '',
  };

  const slotA = rerolled.a ? (hasA1 ? byId.get('a1')! : ({ ...rerolledMessage, id: 'ax' } as any)) : byId.get('a');
  const slotB = rerolled.b ? (hasB1 ? byId.get('b1')! : ({ ...rerolledMessage, id: 'bx' } as any)) : byId.get('b');
  const slotC = rerolled.c ? (hasC1 ? byId.get('c1')! : ({ ...rerolledMessage, id: 'cx' } as any)) : byId.get('c');

  const visible = [slotA, slotB, slotC].filter((x): x is Opt => Boolean(x));

  const best = byId.get(proPickId);

  const pickedOpt =
    choice?.kind === 'picked' ? byId.get(choice.chosenId) : null;

  const wasCorrect =
    choice?.kind === 'picked' ? choice.chosenId === proPickId : false;

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Spot {i + 1} / {playable.length} (original #{spot.idx}) · Score {score.correct}/{score.total}
          </div>
          <h2 className="mt-2 text-xl font-semibold">Choose an augment</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            You may reroll each slot once.
          </p>
        </div>
      </div>

      {spot.screenshotUrl ? (
        <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          {/* Avoid Next/Image remotePatterns config for blob URLs. */}
          <img
            src={spot.screenshotUrl}
            alt={`Spot ${spot.idx} screenshot`}
            className="h-auto w-full"
          />
        </div>
      ) : null}

      <div className="mt-6 grid gap-3">
        {visible.map((a) => {
          const selected = choice?.kind === 'picked' && choice.chosenId === a.id;
          const base = a.id[0] as 'a' | 'b' | 'c';
          const hasReroll =
            (base === 'a' && !rerolled.a) ||
            (base === 'b' && !rerolled.b) ||
            (base === 'c' && !rerolled.c);

          return (
            <div
              key={a.id}
              className={
                'flex w-full items-stretch overflow-hidden rounded-xl border transition-colors ' +
                (selected ? 'border-black dark:border-white' : 'border-zinc-200 dark:border-zinc-800')
              }
            >
              <button
                onClick={() => {
                  if (choice) return;
                  if (a.id.endsWith('x')) return;
                  setChoice({ kind: 'picked', chosenId: a.id });
                }}
                disabled={!!choice || a.id.endsWith('x')}
                className={
                  'flex flex-1 items-center justify-between px-4 py-3 text-left text-sm font-medium transition-colors ' +
                  (selected
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-black'
                    : 'bg-white text-zinc-900 hover:bg-zinc-50 disabled:opacity-60 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900')
                }
              >
                <span className={'truncate' + (a.id.endsWith('x') ? ' text-zinc-600 dark:text-zinc-300' : '')}>
                  {a.name}
                </span>
                <span className="ml-3 text-xs opacity-70">Pick</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (choice) return;

                  // Always allow reroll once per slot.
                  setRerolled((r) => ({ ...r, [base]: true }));

                  // MVP rule: if the pro action is a direct pick (not reroll-then-pick), and the
                  // user rerolls the slot that contained the pro pick, they instantly lose.
                  if (proAction === 'pick' && base === proBase) {
                    setChoice({ kind: 'auto_lose_reroll', base, proPickId });
                  }
                }}
                disabled={!!choice || !hasReroll}
                className={
                  'flex w-24 items-center justify-center border-l px-3 text-xs font-medium transition-colors ' +
                  (selected
                    ? 'border-black bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-black'
                    : 'border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900')
                }
              >
                Reroll
              </button>
            </div>
          );
        })}
      </div>

      {choice && (
        <div className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="font-semibold">
            Best pick: {best?.name ?? '(missing)'}
          </div>

          {choice.kind === 'picked' ? (
            <div className="mt-1 text-zinc-600 dark:text-zinc-300">
              You picked: {pickedOpt?.name ?? '(missing)'}
              {wasCorrect ? ' (correct)' : ' (wrong)'}
            </div>
          ) : (
            <div className="mt-1 text-zinc-600 dark:text-zinc-300">
              You rerolled the pro-selected slot ({choice.base.toUpperCase()}) → instant loss.
            </div>
          )}

          {spot.note ? (
            <div className="mt-3 whitespace-pre-wrap text-zinc-700 dark:text-zinc-200">
              {spot.note}
            </div>
          ) : null}

          <div className="mt-4">
            <button
              onClick={next}
              className="h-11 rounded-xl bg-black px-4 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
