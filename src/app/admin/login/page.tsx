import Link from 'next/link';
import { loginAction } from './actions';

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const hasError = sp.error === '1';
  const hasServerError = sp.error === 'server';

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 dark:bg-black dark:text-zinc-50">
      <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-5 py-10">
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            ← Home
          </Link>
          <div className="text-sm text-zinc-500 dark:text-zinc-400">Admin</div>
        </header>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h1 className="text-xl font-semibold">Pro login</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Sign in to create training sets and choose correct answers.
          </p>

          {hasError && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-100">
              Invalid email or password.
            </div>
          )}

          {hasServerError && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-100">
              Server error while logging in. Check Vercel runtime logs.
            </div>
          )}

          <form action={loginAction} className="mt-6 grid gap-3">
            <label className="grid gap-1">
              <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Email
              </span>
              <input
                name="email"
                type="email"
                required
                className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Password
              </span>
              <input
                name="password"
                type="password"
                required
                className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
              />
            </label>

            <button
              type="submit"
              className="mt-2 h-11 rounded-xl bg-black px-4 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Sign in
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
