import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Public routes that don't require authentication
    const publicRoutes = ['/', '/register', '/forgot-password', '/reset-password'];
    const { pathname } = request.nextUrl;

    // Check if the current path is a public route
    const isPublicRoute = publicRoutes.some(route => pathname === route);

    // For now, we'll just allow all routes since we're using client-side auth
    // In production, you'd want to check cookies/tokens here
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
