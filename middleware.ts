import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAccessToken } from './lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    console.log('[MIDDLEWARE] Checking admin access for:', pathname);
    
    // Get token from cookie (primary) or Authorization header (fallback)
    const cookieToken = request.cookies.get('accessToken')?.value;
    const authHeader = request.headers.get('authorization');
    const headerToken = authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7)
      : null;

    const token = cookieToken || headerToken;

    if (!token) {
      console.log('[MIDDLEWARE] No token found, redirecting to login');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const user = await verifyAccessToken(token);

    if (!user) {
      console.log('[MIDDLEWARE] Invalid token, redirecting to login');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (user.role !== 'ADMIN') {
      console.log('[MIDDLEWARE] User is not ADMIN, role:', user.role);
      return NextResponse.redirect(new URL('/login', request.url));
    }

    console.log('[MIDDLEWARE] Admin access granted for:', user.email);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
