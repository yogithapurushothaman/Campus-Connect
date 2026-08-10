import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { verifyPassword, signAuthToken, AUTH_COOKIE_NAME } from '../../../../lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, role } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Optional: If user selected a specific role tab during login, verify it matches
    if (role && user.role !== role) {
      return NextResponse.json(
        {
          error: `This account is registered as a ${user.role}. Please switch to the ${user.role} login tab.`,
        },
        { status: 403 }
      );
    }

    // Sign JWT session token
    const token = await signAuthToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as 'STAFF' | 'STUDENT',
    });

    const redirectTo = user.role === 'STAFF' ? '/staff-dashboard' : '/student-dashboard';

    const response = NextResponse.json(
      {
        message: 'Logged in successfully.',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        redirectTo,
      },
      { status: 200 }
    );

    // Set secure cookie
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error?.message || 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}
