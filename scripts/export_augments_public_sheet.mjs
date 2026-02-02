import fs from 'node:fs/promises';
import path from 'node:path';

const SHEET_ID = process.env.AUGMENTS_SHEET_ID;
const SHEET_TAB = process.env.AUGMENTS_SHEET_TAB ?? 'Augments';

if (!SHEET_ID) {
  console.error('Missing AUGMENTS_SHEET_ID env var');
  process.exit(1);
}

// Public CSV export endpoint (works if sheet is shared with link / public)
const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_TAB)}`;

function norm(s) {
  return String(s ?? '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

function isTruthy(v) {
  const s = String(v ?? '').trim().toLowerCase();
  if (!s) return false;
  return !(s === '0' || s === 'false' || s === 'no' || s === 'n');
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cur = '';
  let i = 0;
  let inQuotes = false;

  while (i < text.length) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cur += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      cur += ch;
      i += 1;
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }

    if (ch === ',') {
      row.push(cur);
      cur = '';
      i += 1;
      continue;
    }

    if (ch === '\n') {
      row.push(cur);
      cur = '';
      rows.push(row);
      row = [];
      i += 1;
      continue;
    }

    if (ch === '\r') {
      i += 1;
      continue;
    }

    cur += ch;
    i += 1;
  }

  // last cell
  row.push(cur);
  // last row only if non-empty
  if (row.length > 1 || row[0] !== '') rows.push(row);

  return rows;
}

async function main() {
  const res = await fetch(csvUrl);
  if (!res.ok) {
    throw new Error(`Failed to fetch CSV (${res.status}): ${csvUrl}`);
  }
  const csv = await res.text();
  const values = parseCsv(csv);
  if (values.length === 0) throw new Error('Empty CSV');

  const [header, ...rows] = values;
  const idx = (col) => header.findIndex((h) => norm(h) === norm(col));

  const iName = idx('name');
  const iTier = idx('tier');
  const iDesc = idx('description');
  const iS2 = idx('stage2');
  const iS3 = idx('stage3');
  const iS4 = idx('stage4');

  if (iName === -1 || iTier === -1 || iDesc === -1) {
    throw new Error('Header must include name, tier, description');
  }

  const out = [];
  for (const r of rows) {
    const name = String(r[iName] ?? '').trim();
    if (!name) continue;

    const tierRaw = String(r[iTier] ?? '').trim().toLowerCase();
    const tier = (() => {
      if (tierRaw === '1') return 'silver';
      if (tierRaw === '2') return 'gold';
      if (tierRaw === '3') return 'prismatic';
      if (tierRaw.includes('silver')) return 'silver';
      if (tierRaw.includes('gold')) return 'gold';
      if (tierRaw.includes('prismatic') || tierRaw.includes('prism')) return 'prismatic';
      return null;
    })();
    if (!tier) continue;

    const description = String(r[iDesc] ?? '').trim();
    const stages = {
      2: iS2 === -1 ? false : isTruthy(r[iS2]),
      3: iS3 === -1 ? false : isTruthy(r[iS3]),
      4: iS4 === -1 ? false : isTruthy(r[iS4]),
    };

    out.push({ name, tier, description, stages });
  }

  out.sort((a, b) => a.name.localeCompare(b.name));

  const dest = path.join(process.cwd(), 'src', 'data', 'augments.json');
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, JSON.stringify(out, null, 2) + '\n');
  console.log(`Wrote ${out.length} augments to ${dest}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
