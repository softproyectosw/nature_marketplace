import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware
 * 
 * Handles:
 * - Authentication protection for dashboard routes
 * - Language detection and redirection
 */

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/favorites',
  '/tracker',
  '/sponsor',
  '/checkout',
];

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get auth token from cookies or check localStorage via header
  // Note: localStorage is not accessible in middleware, so we use cookies
  // The frontend should sync tokens to cookies for middleware access
  const token = request.cookies.get('nature_access_token')?.value;
  const isAuthenticated = !!token;
  
  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  
  // Check if route is auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  
  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Redirect authenticated users from auth routes to dashboard
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
};
