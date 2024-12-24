import { withAuth } from "next-auth/middleware";
import { NextResponse } from 'next/server';

export default withAuth({
  callbacks: {
    authorized: ({ token }) => {
      // If token exists, the user is authorized
      return !!token;
    },
  },
});

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // List of reserved paths
  const reservedPaths = ['/_next', '/api', '/login', '/register', '/set-username', '/404', '/500', '/favicon.ico','/dashboard'];

  // If the pathname starts with any of the reserved paths, skip the middleware
  if (reservedPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // If the pathname has a dot (.) in it, it's likely a file, so skip
  if (pathname.includes('.')) {
    return NextResponse.next();
  }

  // Otherwise, treat it as a username and continue
  return NextResponse.next();
}

// Apply middleware to all routes
export const config = {
  matcher: '/:path*',
};