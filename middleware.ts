/**
 * middleware.ts (root level)
 * Protects /checkout, /track-order, and /admin routes.
 * Admin routes return 403 if authenticated but not admin.
 */
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Protected routes that require login
  const protectedPaths = ['/checkout', '/track-order', '/admin', '/order-confirmation'];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (isProtected && !session) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin routes require admin role
  if (pathname.startsWith('/admin')) {
    const role = (session?.user as any)?.role;
    if (role !== 'admin') {
      return new NextResponse(
        JSON.stringify({ error: 'Forbidden: Admin access required' }),
        { status: 403, headers: { 'content-type': 'application/json' } }
      );
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/checkout/:path*', '/track-order/:path*', '/admin/:path*', '/order-confirmation/:path*'],
};
