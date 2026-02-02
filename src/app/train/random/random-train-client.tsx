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

export default function RandomTrainClient() {
  const [tier, setTier] = useState<Tier>("silver");
  const [stage, setStage] = useState<2 | 3 | 4>(2);
  const [count, setCount] = useState(6);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    params.set("tier", tier);
    params.set("count", String(count));
    params.set("stage", String(stage));
    return params.toString();
  }, [tier, count, stage]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/augments/random?${query}`, { cache: "no-store" });
      const json = (await res.json()) as ApiResponse;
      if (!res.ok) {
        setData(null);
        setError(json?.error ?? `Request failed (${res.status})`);
      } else {
        setData(json);
        setError(null);
      }
    } catch (e) {
      setData(null);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    // Auto-load once on page open
    void load();
  }, [load]);

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Random augment generator</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Picks {count} augments from the selected tier that are available on the selected stage.
          </p>
        </div>

        <button
          onClick={() => void load()}
          disabled={loading}
          className="h-11 rounded-xl bg-black px-4 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          {loading ? "Loading…" : "Reroll"}
        </button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
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

        <label className="grid gap-1">
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Count</span>
          <input
            type="number"
            min={1}
            max={12}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
          />
        </label>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-100">
          {error}
        </div>
      )}

      <div className="mt-6 grid gap-3">
        {(data?.augments ?? []).map((a) => (
          <div
            key={a.name}
            className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="font-semibold">{a.name}</div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">{a.tier}</div>
            </div>
            <div className="mt-2 text-sm leading-6 text-zinc-700 dark:text-zinc-300">{a.description}</div>
          </div>
        ))}
      </div>

      {!loading && data && (data.augments?.length ?? 0) === 0 && !error && (
        <div className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">No augments returned.</div>
      )}
    </section>
  );
}
