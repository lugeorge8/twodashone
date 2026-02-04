"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { uploadScreenshotsAction } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-11 rounded-xl bg-black px-4 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
    >
      {pending ? "Uploading…" : "Upload"}
    </button>
  );
}

export default function UploadForm() {
  const [count, setCount] = useState(0);

  return (
    <form
      action={uploadScreenshotsAction}
      encType="multipart/form-data"
      className="mt-6 grid gap-4"
      onChange={(e) => {
        const input = (e.target as HTMLElement).closest("form")?.querySelector<HTMLInputElement>(
          'input[type="file"][name="files"]',
        );
        setCount(input?.files?.length ?? 0);
      }}
    >
      <label className="grid gap-1">
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Patch</span>
        <input
          name="patch"
          placeholder="16.03b"
          required
          className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
        />
      </label>

      <label className="grid gap-1">
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Mode</span>
        <select
          name="mode"
          defaultValue="augment_2_1"
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
          name="stage"
          defaultValue="1-4"
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
          name="files"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="text-sm"
          multiple
          required
        />
        <div className="text-xs text-zinc-500 dark:text-zinc-400">
          Tip: you can select multiple files at once.
        </div>
      </label>

      <SubmitButton />
    </form>
  );
}
