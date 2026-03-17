import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Kill switch: set TWODASHONE_ADMIN_DISABLED=1 to block all /admin routes.
export function middleware(req: NextRequest) {
  const disabled = (process.env.TWODASHONE_ADMIN_DISABLED ?? '').trim();
  if (disabled === '1' || disabled.toLowerCase() === 'true') {
    // Block all admin traffic (including login) with a 503.
    return NextResponse.json(
      {
        ok: false,
        error: 'Admin temporarily disabled',
      },
      { status: 503 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
