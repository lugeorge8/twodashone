"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import { modeToStageLabel } from "@/lib/training/modes";

export default function UploadForm() {
  const router = useRouter();

  const [patch, setPatch] = useState("16.04");
  const [mode, setMode] = useState("augment_2_1");
  const [files, setFiles] = useState<File[]>([]);

  const count = files.length;
  const stageLabel = modeToStageLabel(mode as any);

  const patchOptions = useMemo(() => {
    const out: string[] = [];
    for (let i = 1; i <= 10; i++) {
      out.push(`16.${String(i).padStart(2, '0')}`);
    }
    return out;
  }, []);

  const disabled = useMemo(() => {
    return !patch.trim() || files.length === 0;
  }, [patch, files.length]);

  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (uploading) return;

    setUploading(true);
    setError(null);
    setDone(0);

    try {
      for (const f of files) {
        const safePatch = encodeURIComponent(patch.trim());
        const uniqueName = `${crypto.randomUUID()}-${f.name}`;
        const pathname = `screenshots-library/${safePatch}/${uniqueName}`;

        const blob = await upload(pathname, f, {
          access: "public",
          handleUploadUrl: "/api/blob",
          clientPayload: JSON.stringify({ patch: patch.trim(), mode, stage: stageLabel }),
        });

        // Register in DB via API so the UI can reflect it immediately.
        const res = await fetch('/api/screenshots/register', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ patch: patch.trim(), mode, stage: stageLabel, url: blob.url }),
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`register failed: ${res.status} ${text}`);
        }

        setDone((v) => v + 1);
      }

      // Refresh recent list + show ok banner
      router.push("/admin/screenshots?ok=1");
      router.refresh();
      setFiles([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
    }
  }

  return (
    <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
      <label className="grid gap-1">
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Patch</span>
        <select
          value={patch}
          onChange={(e) => setPatch(e.target.value)}
          className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
        >
          {patchOptions.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-1">
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Mode</span>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
        >
          <option value="augment_2_1">Augments (2-1)</option>
          <option value="augment_3_2">Augments (3-2)</option>
          <option value="augment_4_2">Augments (4-2)</option>
        </select>
      </label>

      <div className="rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
        Stage label will be set automatically from Mode: <span className="font-mono">{stageLabel}</span>
      </div>

      <label className="grid gap-1">
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Images ({count} selected)
        </span>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="text-sm"
          multiple
          required
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
        />
        <div className="text-xs text-zinc-500 dark:text-zinc-400">
          Tip: you can select multiple files at once.
        </div>
      </label>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-100">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={uploading || disabled}
        className="h-11 rounded-xl bg-black px-4 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
      >
        {uploading ? `Uploading… (${done}/${count})` : "Upload"}
      </button>
    </form>
  );
}
