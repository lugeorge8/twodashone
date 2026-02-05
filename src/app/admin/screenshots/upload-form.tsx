"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";

export default function UploadForm() {
  const router = useRouter();

  const [patch, setPatch] = useState("");
  const [mode, setMode] = useState("augment_2_1");
  const [stage, setStage] = useState("1-4");
  const [files, setFiles] = useState<File[]>([]);

  const count = files.length;

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

        await upload(pathname, f, {
          access: "public",
          handleUploadUrl: "/api/blob",
          clientPayload: JSON.stringify({ patch: patch.trim(), mode, stage }),
        });
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
        <input
          value={patch}
          onChange={(e) => setPatch(e.target.value)}
          placeholder="16.03b"
          required
          className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
        />
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

      <label className="grid gap-1">
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Stage label</span>
        <input
          value={stage}
          onChange={(e) => setStage(e.target.value)}
          className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
        />
        <div className="text-xs text-zinc-500 dark:text-zinc-400">
          Freeform label for the screenshot (e.g. 1-4, 3-1 board, etc.).
        </div>
      </label>

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
