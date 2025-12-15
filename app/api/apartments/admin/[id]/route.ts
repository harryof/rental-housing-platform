import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin(request);

    const body = await request.json();
    const { title, city, address, pricePerDay, bedrooms, description, photos, isActive } = body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (city !== undefined) updateData.city = city;
    if (address !== undefined) updateData.address = address;
    if (pricePerDay !== undefined) updateData.pricePerDay = parseInt(pricePerDay);
    if (bedrooms !== undefined) updateData.bedrooms = parseInt(bedrooms);
    if (description !== undefined) updateData.description = description;
    if (photos !== undefined) updateData.photos = photos;
    if (isActive !== undefined) updateData.isActive = isActive;

    const apartment = await prisma.apartment.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({ apartment });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      );
    }
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Apartment not found' },
        { status: 404 }
      );
    }
    console.error('Error updating apartment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin(request);

    await prisma.apartment.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Apartment deleted successfully' });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      );
    }
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Apartment not found' },
        { status: 404 }
      );
    }
    console.error('Error deleting apartment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
