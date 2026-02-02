import Link from "next/link";
import TrainClient from "./train-client";

export default function TrainPage() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 dark:bg-black dark:text-zinc-50">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-5 py-10">
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            ← Home
          </Link>
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            twodashone · Stage 2-1
          </div>
        </header>

        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Trainer</h1>
          <Link
            href="/train/random"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            Random generator →
          </Link>
        </div>

        <TrainClient />

        <footer className="pt-4 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
          Disclaimer: This is a training tool. “Best pick” reflects the referenced streamer
          choice for that scenario and may not generalize.
        </footer>
      </main>
    </div>
  );
}
