'use server';

import { redirect } from 'next/navigation';
import { verifyProLogin } from '@/lib/auth/pros';
import { getSession } from '@/lib/auth/session';

export async function loginAction(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');

  try {
    const pro = await verifyProLogin(email, password);
    if (!pro) {
      redirect('/admin/login?error=1');
    }

    const session = await getSession();
    session.proId = pro.id;
    session.email = pro.email;
    session.displayName = pro.displayName;
    session.isLoggedIn = true;
    await session.save();

    redirect('/admin');
  } catch (e) {
    // Ensure the underlying error appears in Vercel runtime logs.
    console.error('loginAction failed', { email, error: e });
    redirect('/admin/login?error=server');
  }
}

export async function logoutAction() {
  const session = await getSession();
  session.destroy();
  redirect('/');
}
