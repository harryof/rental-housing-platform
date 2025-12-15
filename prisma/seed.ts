import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin12345', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@local.test' },
    update: {},
    create: {
      email: 'admin@local.test',
      passwordHash: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('Admin user created:', admin);

  const apartments = [
    {
      title: 'Modern Downtown Loft',
      city: 'New York',
      address: '123 Broadway St',
      pricePerDay: 250,
      bedrooms: 2,
      description:
        'Beautiful modern loft in the heart of downtown with stunning city views.',
      photos: [
        'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
        'https://images.pexels.com/photos/1571463/pexels-photo-1571463.jpeg',
      ],
      isActive: true,
    },
    {
      title: 'Cozy Studio Apartment',
      city: 'San Francisco',
      address: '456 Market St',
      pricePerDay: 150,
      bedrooms: 1,
      description:
        'Charming studio apartment perfect for solo travelers or couples.',
      photos: [
        'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg',
      ],
      isActive: true,
    },
    {
      title: 'Luxury Penthouse',
      city: 'Los Angeles',
      address: '789 Sunset Blvd',
      pricePerDay: 500,
      bedrooms: 3,
      description:
        'Spectacular penthouse with panoramic views and premium amenities.',
      photos: [
        'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg',
      ],
      isActive: true,
    },
  ];

  for (const apt of apartments) {
    await prisma.apartment.create({
      data: apt,
    });
  }

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
