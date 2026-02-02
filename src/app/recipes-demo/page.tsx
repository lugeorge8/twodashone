export const dynamic = 'force-dynamic';

type Recipe = {
  title: string;
  url: string;
  source?: string;
};

async function fetchRecipes(): Promise<Recipe[]> {
  // Demo-only: replace with a proper recipe API later.
  // We keep it server-side to avoid CORS issues.
  const seed = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const queries = ['easy dinner recipe', 'high protein recipe', 'vegetarian recipe'];

  // Lightweight “demo”: use a search engine result page is brittle; use static list for now.
  // (We can swap to Spoonacular/Edamam/etc once you want real web-pulled recipes.)
  return queries.map((q, i) => ({
    title: `Recipe pick ${i + 1} (${seed}): ${q}`,
    url: `https://www.google.com/search?q=${encodeURIComponent(q)}`,
    source: 'Google Search',
  }));
}

export default async function RecipesDemoPage() {
  const recipes = await fetchRecipes();

  return (
    <main style={{ maxWidth: 720, margin: '40px auto', padding: 16 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Daily Recipe Recommendations (Demo)</h1>
      <p style={{ marginTop: 8, color: '#666' }}>
        Demo page showing 3 “recommendations” per day. We can swap to a real recipe API later.
      </p>

      <ol style={{ marginTop: 24 }}>
        {recipes.map((r) => (
          <li key={r.url} style={{ marginBottom: 16 }}>
            <a href={r.url} target="_blank" rel="noreferrer" style={{ fontWeight: 600 }}>
              {r.title}
            </a>
            {r.source ? <div style={{ fontSize: 12, color: '#888' }}>Source: {r.source}</div> : null}
          </li>
        ))}
      </ol>
    </main>
  );
}
