import { createClient, createPool } from '@vercel/postgres';

// Robust DB adapter for Vercel Postgres env vars.
// - If POSTGRES_URL is pooled (recommended on Vercel serverless), we use a Pool.
// - If POSTGRES_URL_NON_POOLING is available, we use a direct Client.
// - We explicitly reject Prisma Accelerate connection strings.

type QueryResult<T> = { rows: T[] };

type Runner = {
  query: <T = any>(text: string, params?: any[]) => Promise<QueryResult<T>>;
};

let runnerPromise: Promise<Runner> | null = null;

function isPrismaAccelerate(cs: string) {
  return /^prisma\+postgres:/.test(cs) || /accelerate\.prisma-data\.net/i.test(cs);
}

function looksPooled(cs: string) {
  return /pooler/i.test(cs);
}

async function getRunner(): Promise<Runner> {
  if (runnerPromise) return runnerPromise;

  const nonPooling = process.env.POSTGRES_URL_NON_POOLING;
  const pooled = process.env.POSTGRES_URL;

  const connectionString = nonPooling || pooled;
  if (!connectionString) {
    throw new Error('Missing POSTGRES_URL (and POSTGRES_URL_NON_POOLING)');
  }

  if (isPrismaAccelerate(connectionString)) {
    throw new Error('Prisma Accelerate URL detected. Use Vercel Postgres (Neon) POSTGRES_URL env vars instead.');
  }

  // Prefer non-pooling direct connection if present.
  if (nonPooling) {
    const client = createClient({ connectionString: nonPooling });
    runnerPromise = (async () => {
      await client.connect();
      return {
        query: async (text, params) => {
          const res = await client.query(text, params);
          return { rows: res.rows };
        },
      };
    })();
    return runnerPromise;
  }

  // Otherwise use pooled URL.
  if (!pooled) {
    throw new Error('POSTGRES_URL_NON_POOLING not set and POSTGRES_URL missing.');
  }

  if (!looksPooled(pooled)) {
    // Vercel sometimes provides direct URLs too; but createPool will reject them.
    // In that case, you must set POSTGRES_URL_NON_POOLING.
    throw new Error('POSTGRES_URL looks like a direct URL. Set POSTGRES_URL_NON_POOLING for direct connections.');
  }

  const pool = createPool({ connectionString: pooled });
  runnerPromise = Promise.resolve({
    query: async (text, params) => {
      const res = await pool.query(text, params);
      return { rows: res.rows };
    },
  });
  return runnerPromise;
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

export async function sql<T = any>(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Promise<QueryResult<T>> {
  const runner = await getRunner();
  const { text, params } = buildQuery(strings, values);
  return runner.query<T>(text, params as any[]);
}
