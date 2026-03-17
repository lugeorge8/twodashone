'use client';

import { useEffect, useState } from 'react';

export default function LightboxImage(props: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={props.src}
        alt={props.alt}
        className={(props.className ?? '') + ' cursor-zoom-in'}
        onClick={() => setOpen(true)}
      />

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          onClick={() => setOpen(false)}
        >
          <div className="relative max-h-full max-w-[min(1100px,100%)]" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-2 top-2 rounded-lg bg-black/60 px-2 py-1 text-xs font-medium text-white hover:bg-black/80"
            >
              Close
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={props.src}
              alt={props.alt}
              className="max-h-[85vh] w-auto max-w-full cursor-zoom-out rounded-xl border border-white/10 bg-black"
              onClick={() => setOpen(false)}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
