import { NextResponse } from 'next/server';

export function middleware(req) {
  const accessToken = req.cookies.get('access_token');
  const { pathname } = req.nextUrl;

  // List of protected routes
  const protectedPaths = [
    // '/home',
    '/dashboard',
    '/profile'
  ];

  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  // Redirect if not authenticated
  if (isProtected && !accessToken) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    '/home/:path*',
    '/dashboard/:path*',
    '/profile/:path*'
  ]
}