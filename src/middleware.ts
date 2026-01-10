import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware is no longer needed with Firebase Auth.
// Firebase's client-side SDK and `useUser` hook will handle auth state.
// Redirects will be handled in the components themselves.
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
