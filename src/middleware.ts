import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session');
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    try {
      // Basic validation. In a real app, you'd decrypt/verify the session.
      const session = JSON.parse(sessionCookie.value);
      if (!session.user) {
        throw new Error('Invalid session');
      }
    } catch (e) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  if (pathname === '/login' && sessionCookie) {
    try {
      const session = JSON.parse(sessionCookie.value);
      if (session.user) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
    } catch (e) {
      // Invalid cookie, let them proceed to login
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
};
