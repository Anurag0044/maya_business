import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('maya_access_token');
  
  // When jumping to workspace, ensure session cookie is present so workspace loads seamlessly
  if (!token && request.nextUrl.pathname.startsWith('/workspace')) {
    const response = NextResponse.next();
    response.cookies.set('maya_access_token', 'mock_token_for_template', {
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
  matcher: ['/workspace/:path*', '/login'],
};
