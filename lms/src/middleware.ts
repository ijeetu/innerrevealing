import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (/^\/(?:instructor|create-course|become-instructor|my-teams)(?:\/|$)/.test(path)) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }
  if (path === '/my-wallet' || path === '/billing-details') return NextResponse.redirect(new URL('/transaction-history', request.url));
  if (path === '/admin/login') return NextResponse.next();
  if (!request.cookies.get('ir_session')?.value) {
    return NextResponse.redirect(new URL(path.startsWith('/admin') ? '/admin/login' : '/', request.url));
  }
  // All sensitive data and actions re-check the MySQL session and role server-side.
  const response = NextResponse.next();
  response.headers.set('Cache-Control', 'private, no-store');
  if (path.startsWith('/admin')) response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return response;
}
export const config = { matcher: ['/admin/:path*', '/instructor/:path*', '/create-course', '/become-instructor/:path*', '/my-teams/:path*', '/edit-profile', '/account-security', '/my-learnings', '/my-wishlist', '/notifications', '/transaction-history', '/delete-account', '/my-wallet', '/billing-details'] };
