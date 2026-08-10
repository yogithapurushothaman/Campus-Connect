import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getServerSession } from '../../../lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const authorId = searchParams.get('authorId');

    const whereClause = authorId ? { authorId } : {};

    const events = await prisma.event.findMany({
      where: whereClause,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ events }, { status: 200 });
  } catch (error: any) {
    console.error('Fetch events error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required. Please log in.' },
        { status: 401 }
      );
    }

    // Role-based access control check: Only STAFF can create events
    if (session.role !== 'STAFF') {
      return NextResponse.json(
        { error: 'Forbidden: Only staff members are authorized to create campus events.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { title, description, date, category, locationName } = body;

    if (!title || !description || !date) {
      return NextResponse.json(
        { error: 'Title, description, and date are required.' },
        { status: 400 }
      );
    }

    const newEvent = await prisma.event.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        date: date.trim(),
        category: category?.trim() || 'General',
        locationName: locationName?.trim() || 'Main Campus',
        authorId: session.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(
      { message: 'Event published successfully.', event: newEvent },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create event error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to publish event.' },
      { status: 500 }
    );
  }
}
