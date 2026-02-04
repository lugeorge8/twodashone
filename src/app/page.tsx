import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 dark:bg-black dark:text-zinc-50">
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-between px-5 py-12">
        <header className="flex flex-col gap-4">
          <div className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            twodashone
          </div>
          <h1 className="text-3xl font-semibold leading-tight tracking-tight">
            Practice Stage 2-1 augment decisions.
          </h1>
          <p className="max-w-xl text-base leading-7 text-zinc-600 dark:text-zinc-400">
            10 quick scenarios, plus curated training sets scored against pro answers.
          </p>
        </header>

        <section className="mt-10 grid gap-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-semibold">MVP set</div>
                <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  10 questions · instant feedback
                </div>
              </div>
              <Link
                href="/train"
                className="flex h-11 items-center justify-center rounded-xl bg-black px-4 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                Start MVP
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-semibold">Training set generator</div>
                <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Generates 3 choices with a one-time reroll per slot (like MVP)
                </div>
              </div>
              <Link
                href="/train/random"
                className="flex h-11 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
              >
                Open generator
              </Link>
            </div>
          </div>
        </section>

        <footer className="mt-10 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
          Built for reps. Not a solver. Best pick = the referenced streamer’s choice for the
          scenario.
        </footer>
      </main>
    </div>
  );
}
