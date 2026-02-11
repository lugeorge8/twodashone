import Link from "next/link";
import RandomTrainClient from "./random-train-client";

export default function RandomTrainPage() {
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
          <div className="text-sm text-zinc-500 dark:text-zinc-400">twodashone · Random augments</div>
        </header>

        <RandomTrainClient />

        <footer className="pt-4 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
          Pulls augments from your Google Sheet and generates 6 options for the chosen tier + stage.
        </footer>
      </main>
    </div>
  );
}
