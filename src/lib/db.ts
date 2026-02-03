import { createClient } from '@vercel/postgres';

// Vercel Postgres (Neon) can provide either pooled or direct connection strings.
// The `sql` tagged template from @vercel/postgres requires a *pooled* string.
// To be robust (and to support multi-statement transactions), we implement our own
// sql tag on top of a direct pg Client.
//
// IMPORTANT: This is a minimal MVP implementation. It uses a single shared client
// and a simple mutex to avoid concurrent transactions stepping on each other.

let clientPromise: Promise<ReturnType<typeof createClient>> | null = null;

async function getClient() {
  if (!clientPromise) {
    const connectionString =
      process.env.POSTGRES_URL_NON_POOLING ||
      process.env.POSTGRES_URL ||
      process.env.POSTGRES_PRISMA_URL;

    if (!connectionString) {
      throw new Error('Missing POSTGRES_URL env var(s)');
    }

    const client = createClient({ connectionString });
    clientPromise = (async () => {
      await client.connect();
      return client;
    })();
  }
  return clientPromise;
}

// Simple mutex so BEGIN/COMMIT blocks don't interleave across requests.
let lock: Promise<void> = Promise.resolve();
async function withLock<T>(fn: () => Promise<T>): Promise<T> {
  let release!: () => void;
  const next = new Promise<void>((r) => (release = r));
  const prev = lock;
  lock = prev.then(() => next);
  await prev;
  try {
    return await fn();
  } finally {
    release();
  }
}

function buildQuery(strings: TemplateStringsArray, values: unknown[]) {
  let text = '';
  const params: unknown[] = [];
  for (let i = 0; i < strings.length; i++) {
    text += strings[i];
    if (i < values.length) {
      params.push(values[i]);
      text += `$${params.length}`;
    }
  }
  return { text, params };
}

export type SqlResult<T> = { rows: T[] };

export async function sql<T = any>(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Promise<SqlResult<T>> {
  return withLock(async () => {
    const client = await getClient();
    const { text, params } = buildQuery(strings, values);
    const res = await client.query(text, params);
    return { rows: res.rows as T[] };
  });
}
