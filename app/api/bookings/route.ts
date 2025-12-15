import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    // Only USER role can create bookings
    if (user.role !== 'USER') {
      return NextResponse.json(
        { error: 'Only users can create bookings' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { apartmentId, startDate, endDate } = body;

    if (!apartmentId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'apartmentId, startDate, and endDate are required' },
        { status: 400 }
      );
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    if (start < now) {
      return NextResponse.json(
        { error: 'Start date must be in the future' },
        { status: 400 }
      );
    }

    if (end <= start) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    // Get apartment
    const apartment = await prisma.apartment.findUnique({
      where: { id: apartmentId },
    });

    if (!apartment) {
      return NextResponse.json(
        { error: 'Apartment not found' },
        { status: 404 }
      );
    }

    if (!apartment.isActive) {
      return NextResponse.json(
        { error: 'Apartment is not available' },
        { status: 400 }
      );
    }

    // Calculate days and total price
    const numberOfDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = numberOfDays * apartment.pricePerDay;

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId: user.userId,
        apartmentId,
        startDate: start,
        endDate: end,
        totalPrice,
        status: 'CONFIRMED',
      },
      include: {
        apartment: {
          select: {
            id: true,
            title: true,
            city: true,
            address: true,
            pricePerDay: true,
            photos: true,
          },
        },
      },
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

