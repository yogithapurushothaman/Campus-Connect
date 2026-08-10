import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '../../../../lib/auth';

export async function POST(req: NextRequest) {
  const response = NextResponse.json(
    { message: 'Logged out successfully.', redirectTo: '/login' },
    { status: 200 }
  );

  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}

export async function GET(req: NextRequest) {
  return POST(req);
}
