import { getIronSession, type IronSession, type SessionOptions } from 'iron-session';
import { cookies } from 'next/headers';

export type ProSession = {
  proId?: string;
  email?: string;
  displayName?: string;
  isLoggedIn?: boolean;
};

const sessionOptions: SessionOptions = {
  password: process.env.SESSION_PASSWORD || 'dev-only-change-me-dev-only-change-me-dev-only-change-me',
  cookieName: 'twodashone_admin',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
};

export async function getSession(): Promise<IronSession<ProSession>> {
  const session = await getIronSession<ProSession>(await cookies(), sessionOptions);
  return session;
}

export async function requireProSession() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.proId) {
    // Throwing causes a generic 500 on Vercel; redirect is nicer.
    const { redirect } = await import('next/navigation');
    redirect('/admin/login');
  }
  return session;
}
