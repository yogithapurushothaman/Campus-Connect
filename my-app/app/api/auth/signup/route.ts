import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { hashPassword, signAuthToken, AUTH_COOKIE_NAME } from '../../../../lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Name, email, password, and role are required.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!['STAFF', 'STUDENT'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role selected. Must be STAFF or STUDENT.' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email address already exists.' },
        { status: 409 }
      );
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: role as 'STAFF' | 'STUDENT',
      },
    });

    // Create session token
    const token = await signAuthToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as 'STAFF' | 'STUDENT',
    });

    const redirectTo = user.role === 'STAFF' ? '/staff-dashboard' : '/student-dashboard';

    const response = NextResponse.json(
      {
        message: 'Account created successfully.',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        redirectTo,
      },
      { status: 201 }
    );

    // Set HTTP-only secure cookie
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
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create account. Please try again.' },
      { status: 500 }
    );
  }
}
