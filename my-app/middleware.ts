import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken, AUTH_COOKIE_NAME } from './lib/auth';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = token ? await verifyAuthToken(token) : null;

  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const isStaffRoute = pathname.startsWith('/staff-dashboard');
  const isStudentRoute = pathname.startsWith('/student-dashboard');

  // If user is already authenticated and visits /login or /signup, redirect to their role dashboard
  if (isAuthPage && session) {
    const redirectTarget =
      session.role === 'STAFF' ? '/staff-dashboard' : '/student-dashboard';
    return NextResponse.redirect(new URL(redirectTarget, req.url));
  }

  // Protect Staff Dashboard (STAFF ONLY)
  if (isStaffRoute) {
    if (!session) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (session.role !== 'STAFF') {
      // Strictly prevent Students from accessing Staff routes
      const studentUrl = new URL('/student-dashboard', req.url);
      studentUrl.searchParams.set('error', 'unauthorized_staff_only');
      return NextResponse.redirect(studentUrl);
    }
  }

  // Protect Student Dashboard (Authenticated Students and Staff)
  if (isStudentRoute) {
    if (!session) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/staff-dashboard/:path*',
    '/student-dashboard/:path*',
    '/login',
    '/signup',
  ],
};
