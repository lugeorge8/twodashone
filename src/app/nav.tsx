import Link from 'next/link';

const links = [
  { href: '/', label: 'Home' },
  { href: '/train', label: 'MVP' },
  { href: '/sets', label: 'Sets' },
  { href: '/train/random', label: 'Generator' },
  { href: '/admin', label: 'Admin' },
];

export default function Nav() {
  return (
    <div className="border-b border-zinc-200 bg-white/70 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/60">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-3">
        <div className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          twodashone
        </div>
        <nav className="flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
