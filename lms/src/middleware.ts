import { NextResponse, NextRequest } from 'next/server'

/**
 * Middleware to handle authentication for private routes
 */
export function middleware(request: NextRequest) {
  const authToken = request.cookies.get('auth_token')?.value

  if (!authToken) {
    return NextResponse.redirect(new URL('/logout', request.url))
  }

  // Create the response object
  const response = NextResponse.next()

  // Attach token as Authorization header
  response.headers.set('Authorization', `Bearer ${authToken}`)

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
  ],
}
