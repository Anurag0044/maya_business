import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('maya_access_token');
  const isAuthPage = request.nextUrl.pathname.startsWith('/login');
  
  // Protect workspace routes
  if (!token && !isAuthPage && request.nextUrl.pathname.startsWith('/workspace')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Redirect authenticated users away from login
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/workspace', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/workspace/:path*', '/login'],
};
