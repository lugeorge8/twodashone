import bcrypt from 'bcryptjs';
import { sql } from '@/lib/db';

export type Pro = {
  id: string;
  email: string;
  display_name: string;
};

export async function getProByEmail(email: string): Promise<(Pro & { password_hash: string }) | null> {
  const res = await sql<Pro & { password_hash: string }>`
    select id, email, display_name, password_hash
    from pros
    where email = ${email}
    limit 1
  `;
  return res.rows[0] ?? null;
}

export async function verifyProLogin(email: string, password: string) {
  const pro = await getProByEmail(email);
  if (!pro) return null;
  const ok = await bcrypt.compare(password, pro.password_hash);
  if (!ok) return null;
  return { id: pro.id, email: pro.email, displayName: pro.display_name };
}

export async function createPro(params: { email: string; displayName: string; password: string }) {
  const passwordHash = await bcrypt.hash(params.password, 10);
  const res = await sql<Pro>`
    insert into pros (email, display_name, password_hash)
    values (${params.email}, ${params.displayName}, ${passwordHash})
    returning id, email, display_name
  `;
  return res.rows[0];
}
