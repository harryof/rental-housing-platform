import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const apartments = await prisma.apartment.findMany({
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json({ apartments });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      );
    }
    console.error('Error fetching apartments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);

    const body = await request.json();
    const { title, city, address, pricePerDay, bedrooms, description, photos, isActive } = body;

    if (!title || !city || !address || pricePerDay === undefined || bedrooms === undefined || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const apartment = await prisma.apartment.create({
      data: {
        title,
        city,
        address,
        pricePerDay: parseInt(pricePerDay),
        bedrooms: parseInt(bedrooms),
        description,
        photos: photos || [],
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json({ apartment }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      );
    }
    console.error('Error creating apartment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
