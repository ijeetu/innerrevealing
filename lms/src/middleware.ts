import { NextResponse, NextRequest } from 'next/server'

/**
 * Middleware to handle authentication for private routes
 */
export function middleware(request: NextRequest) {
  // Instructor and management screens are unavailable until owner tools exist.
  if (/^\/(?:instructor(?:\/|$)|create-course(?:\/|$)|become-instructor(?:\/|$)|my-teams(?:\/|$))/.test(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/courses', request.url))
  }

  const session = request.cookies.get('ir_session')?.value

  if (!session) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Create the response object
  const response = NextResponse.next()

  // Every protected API validates the opaque session against MySQL.
  return response
}

// Apply middleware ONLY to private routes
export const config = {
  matcher: [
    '/instructor/:path*',
    '/create-course',
    '/edit-profile',
    '/account-security',
    '/my-learnings',
    '/my-wishlist',
    '/notifications',
    '/transaction-history',
    '/delete-account',
    '/my-wallet',
    '/become-instructor/:path*',
    '/my-teams/:path*',
  ],
}
