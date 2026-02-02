export function formatTrainingSetId(params: {
  proSlug: string; // e.g. Dishsoap
  patch: string; // e.g. 16.03b
  seq: number; // 1-based
}) {
  const n = String(params.seq).padStart(4, '0');
  return `${params.proSlug}${params.patch}TS${n}`;
}
