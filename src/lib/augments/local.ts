import fs from 'node:fs/promises';
import path from 'node:path';

import type { AugmentRow } from '../google/sheets';

export async function readAugmentsFromLocalFile(params?: { filePath?: string }): Promise<AugmentRow[]> {
  const filePath = params?.filePath ?? path.join(process.cwd(), 'src', 'data', 'augments.json');
  const raw = await fs.readFile(filePath, 'utf8');
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error('augments.json must be an array');
  return parsed as AugmentRow[];
}
