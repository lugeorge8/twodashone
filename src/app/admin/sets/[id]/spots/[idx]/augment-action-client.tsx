"use client";

import { useMemo, useState } from "react";

type Opt = {
  id: "a" | "b" | "c" | "a1" | "b1" | "c1";
  name: string;
  description: string;
  tier: string;
};

type Props = {
  options: Opt[];
  defaultCorrectPickId?: string | null;
  disabled?: boolean;
};

export default function AugmentActionClient({ options, defaultCorrectPickId, disabled }: Props) {
  const byId = useMemo(() => {
    const m = new Map<string, Opt>();
    for (const o of options) m.set(o.id, o);
    return m;
  }, [options]);

  const [rerolled, setRerolled] = useState({ a: false, b: false, c: false });

  const visible = [
    rerolled.a ? byId.get("a1") ?? byId.get("a") : byId.get("a"),
    rerolled.b ? byId.get("b1") ?? byId.get("b") : byId.get("b"),
    rerolled.c ? byId.get("c1") ?? byId.get("c") : byId.get("c"),
  ].filter(Boolean) as Opt[];

  const defaultRaw = defaultCorrectPickId
    ? (() => {
        const o = byId.get(defaultCorrectPickId) ?? null;
        return o ? `${o.id}::${o.name}` : "";
      })()
    : "";

  return (
    <div className="grid gap-3">
      <div className="text-xs text-zinc-500 dark:text-zinc-400">
        Pro must decide using TFT interaction: A/B/C are shown, reroll reveals A1/B1/C1.
      </div>

      <div className="grid gap-2">
        {(["a", "b", "c"] as const).map((slot) => {
          const shown = visible.find((o) => o.id === slot || o.id === `${slot}1`) ?? null;
          const canReroll = !rerolled[slot];

          return (
            <div
              key={slot}
              className="flex w-full items-stretch overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
            >
              <label className="flex flex-1 cursor-pointer items-start gap-3 px-4 py-3 text-left">
                <input
                  type="radio"
                  name="correctPickRaw"
                  value={shown ? `${shown.id}::${shown.name}` : ""}
                  defaultChecked={defaultRaw !== "" && shown ? defaultRaw === `${shown.id}::${shown.name}` : false}
                  disabled={disabled || !shown}
                />
                <div className="min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold">
                      {slot.toUpperCase()} · {shown?.name ?? "(missing)"}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">{shown?.tier ?? ""}</div>
                  </div>
                  <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                    {shown?.description ?? ""}
                  </div>
                </div>
              </label>

              <button
                type="button"
                onClick={() => setRerolled((r) => ({ ...r, [slot]: true }))}
                disabled={disabled || !canReroll}
                className="flex w-24 items-center justify-center border-l border-zinc-200 px-3 text-xs font-medium text-zinc-800 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-900"
              >
                Reroll
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
