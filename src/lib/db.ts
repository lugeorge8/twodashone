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
  return (
    /^prisma\+postgres:/.test(cs) ||
    /^prisma:/.test(cs) ||
    /accelerate\.prisma-data\.net/i.test(cs) ||
    /db\.prisma\.io/i.test(cs)
  );
}

function isPostgresUrl(cs: string) {
  return /^postgres(ql)?:\/\//i.test(cs);
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
    throw new Error('Prisma/Accelerate connection detected (db.prisma.io). Set POSTGRES_URL to the Vercel Postgres URL (starts with postgres://), not the Prisma database URL.');
  }

  if (!isPostgresUrl(connectionString)) {
    throw new Error('Invalid POSTGRES_URL: must start with postgres:// (or postgresql://).');
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

  // Otherwise use POSTGRES_URL. It might be pooled or direct depending on provider settings.
  if (!pooled) {
    throw new Error('POSTGRES_URL (or POSTGRES_URL_NON_POOLING) is missing');
  }

  if (looksPooled(pooled)) {
    const pool = createPool({ connectionString: pooled });
    runnerPromise = Promise.resolve({
      query: async (text, params) => {
        const res = await pool.query(text, params);
        return { rows: res.rows };
      },
    });
    return runnerPromise;
  }

  // POSTGRES_URL is a direct URL. Fall back to a direct client.
  const client = createClient({ connectionString: pooled });
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
