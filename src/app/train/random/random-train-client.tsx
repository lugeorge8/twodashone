"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Tier = "silver" | "gold" | "prismatic";

type Augment = {
  name: string;
  tier: Tier;
  description: string;
  stages: Record<string, boolean | undefined>;
};

type ApiResponse = {
  tier: Tier;
  count: number;
  stage: number | null;
  augments: Augment[];
  error?: string;
};

type SlotKey = "a" | "b" | "c";

export default function RandomTrainClient() {
  const [tier, setTier] = useState<Tier>("silver");
  const [stage, setStage] = useState<2 | 3 | 4>(2);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [slots, setSlots] = useState<Record<SlotKey, Augment | null>>({
    a: null,
    b: null,
    c: null,
  });
  const [rerolled, setRerolled] = useState<Record<SlotKey, boolean>>({
    a: false,
    b: false,
    c: false,
  });

  const excludeNames = useMemo(() => {
    return Object.values(slots)
      .map((a) => a?.name)
      .filter((x): x is string => Boolean(x));
  }, [slots]);

  const buildQuery = useCallback(
    (count: number, extraExclude: string[] = []) => {
      const params = new URLSearchParams();
      params.set("tier", tier);
      params.set("count", String(count));
      params.set("stage", String(stage));
      const allExclude = [...excludeNames, ...extraExclude];
      for (const n of allExclude) params.append("exclude", n);
      return params.toString();
    },
    [tier, stage, excludeNames],
  );

  const loadInitial = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/augments/random?${buildQuery(3)}`, { cache: "no-store" });
      const json = (await res.json()) as ApiResponse;
      if (!res.ok) {
        setError(json?.error ?? `Request failed (${res.status})`);
        setSlots({ a: null, b: null, c: null });
        return;
      }

      const [a, b, c] = json.augments;
      setSlots({ a: a ?? null, b: b ?? null, c: c ?? null });
      setRerolled({ a: false, b: false, c: false });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setSlots({ a: null, b: null, c: null });
    } finally {
      setLoading(false);
    }
  }, [buildQuery]);

  const rerollSlot = useCallback(
    async (slot: SlotKey) => {
      if (loading) return;
      if (rerolled[slot]) return;

      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/augments/random?${buildQuery(1)}`, { cache: "no-store" });
        const json = (await res.json()) as ApiResponse;
        if (!res.ok) {
          setError(json?.error ?? `Request failed (${res.status})`);
          return;
        }

        const next = json.augments[0] ?? null;
        setSlots((s) => ({ ...s, [slot]: next }));
        setRerolled((r) => ({ ...r, [slot]: true }));
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    },
    [buildQuery, loading, rerolled],
  );

  // Reload if tier/stage changes
  useEffect(() => {
    void loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tier, stage]);

  const visible = ([
    ["a", slots.a],
    ["b", slots.b],
    ["c", slots.c],
  ] as const).filter(([, a]) => Boolean(a));

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Training set generator</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Shows 3 augments. Each slot can be rerolled once (MVP-style).
          </p>
        </div>

        <button
          onClick={() => void loadInitial()}
          disabled={loading}
          className="h-11 rounded-xl bg-black px-4 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          {loading ? "Loading…" : "New roll"}
        </button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1">
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Tier</span>
          <select
            value={tier}
            onChange={(e) => setTier(e.target.value as Tier)}
            className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
          >
            <option value="silver">Silver</option>
            <option value="gold">Gold</option>
            <option value="prismatic">Prismatic</option>
          </select>
        </label>

        <label className="grid gap-1">
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Stage</span>
          <select
            value={stage}
            onChange={(e) => setStage(Number(e.target.value) as 2 | 3 | 4)}
            className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
          >
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
          </select>
        </label>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-100">
          {error}
        </div>
      )}

      <div className="mt-6 grid gap-3">
        {visible.map(([slot, a]) => (
          <div
            key={slot}
            className="flex w-full items-stretch overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="flex-1 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold">{a!.name}</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">{a!.tier}</div>
              </div>
              <div className="mt-2 text-sm leading-6 text-zinc-700 dark:text-zinc-300">{a!.description}</div>
            </div>

            <button
              type="button"
              onClick={() => void rerollSlot(slot)}
              disabled={loading || rerolled[slot]}
              className="flex w-24 items-center justify-center border-l border-zinc-200 px-3 text-xs font-medium text-zinc-800 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-900"
            >
              Reroll
            </button>
          </div>
        ))}
      </div>

      {!loading && !error && visible.length === 0 && (
        <div className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">No augments returned.</div>
      )}
    </section>
  );
}
