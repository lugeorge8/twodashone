"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { QUESTIONS } from "@/lib/questions";

type ChoiceState = {
  chosenAugmentId: string;
};

export default function TrainClient() {
  const questions = useMemo(() => QUESTIONS, []);

  const [idx, setIdx] = useState(0);
  const [choice, setChoice] = useState<ChoiceState | null>(null);
  const [showRerollRow, setShowRerollRow] = useState(false);

  const q = questions[idx];
  const isDone = idx >= questions.length;

  function onChoose(augmentId: string) {
    if (choice) return;
    setChoice({ chosenAugmentId: augmentId });
  }

  function next() {
    setChoice(null);
    setShowRerollRow(false);
    setIdx((v) => v + 1);
  }

  function restart() {
    setChoice(null);
    setShowRerollRow(false);
    setIdx(0);
  }

  if (isDone) {
    return (
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-xl font-semibold">Done.</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          You finished the 10-question MVP set.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={restart}
            className="h-11 rounded-xl bg-black px-4 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Restart
          </button>
          <Link
            href="/"
            className="flex h-11 items-center justify-center rounded-xl border border-zinc-200 px-4 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            Back to home
          </Link>
        </div>
      </section>
    );
  }

  const topRow = q.augments.filter((a) => a.id === "a" || a.id === "b" || a.id === "c");
  const rerollRow = q.augments.filter(
    (a) => a.id === "a1" || a.id === "b1" || a.id === "c1",
  );

  const visibleAugments = showRerollRow ? rerollRow : topRow;

  const best = q.augments.find((a) => a.id === q.topPickAugmentId);
  const picked = choice
    ? q.augments.find((a) => a.id === choice.chosenAugmentId)
    : null;

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Question {idx + 1} / {questions.length}
          </div>
          <h1 className="mt-2 text-xl font-semibold">{q.scenarioTitle}</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            {q.scenarioBody}
          </p>
        </div>
      </div>

      {q.screenshotSrc && (
        <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <Image
            src={q.screenshotSrc}
            alt={`${q.scenarioTitle} - stage 1-4 screenshot`}
            width={1600}
            height={900}
            className="h-auto w-full"
            priority={idx < 2}
          />
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <div className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          {showRerollRow ? "Reroll row" : "Top row"}
        </div>
        <button
          type="button"
          onClick={() => setShowRerollRow(true)}
          disabled={!!choice || showRerollRow || rerollRow.length === 0}
          className="h-9 rounded-xl border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-800 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
        >
          Reroll
        </button>
      </div>

      <div className="mt-3 grid gap-3">
        {visibleAugments.map((a) => {
          const selected = choice?.chosenAugmentId === a.id;
          return (
            <button
              key={a.id}
              onClick={() => onChoose(a.id)}
              disabled={!!choice}
              className={
                "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors " +
                (selected
                  ? "border-black bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-black"
                  : "border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900")
              }
            >
              <span>{a.name}</span>
              <span className="text-xs opacity-70">Pick</span>
            </button>
          );
        })}
      </div>

      {choice && (
        <div className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="font-semibold">
            Best pick: {best?.name ?? "(missing)"}
          </div>
          <div className="mt-1 text-zinc-600 dark:text-zinc-300">
            From: {q.streamerUrl ? (
              <a className="underline" href={q.streamerUrl} target="_blank" rel="noreferrer">
                {q.streamerName}
              </a>
            ) : (
              q.streamerName
            )}
          </div>
          <div className="mt-1 text-zinc-600 dark:text-zinc-300">
            You picked: {picked?.name ?? "(missing)"}
          </div>

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
