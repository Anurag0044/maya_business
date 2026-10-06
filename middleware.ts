import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('maya_access_token');

  // DEV/TEMPLATE MODE: Auto-provision session cookie so workspace loads without a real backend.
  // TODO: Remove this block before production — replace with a redirect to /login.
  if (!token && pathname.startsWith('/workspace')) {
    const response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
    response.cookies.set('maya_access_token', 'dev_template_session', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/workspace', '/workspace/:path*', '/login'],
};
