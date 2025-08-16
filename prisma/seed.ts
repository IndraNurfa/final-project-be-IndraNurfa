import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import slugify from 'slugify';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.userSession.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  await prisma.masterCourts.deleteMany();
  await prisma.masterCourtTypes.deleteMany();

  console.log('Seeding database...');

  // 1. Create roles
  const roleAdmin = await prisma.role.create({
    data: { name: 'Admin', slug: 'admin' },
  });
  const roleUser = await prisma.role.create({
    data: { name: 'User', slug: 'user' },
  });

  // 2. Create users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      full_name: 'Admin User',
      password: hashedPassword,
      role_id: roleAdmin.id,
      created_by: 'seed',
      updated_by: 'seed',
    },
  });

  const user = await prisma.user.create({
    data: {
      email: 'user@example.com',
      full_name: 'Regular User',
      password: hashedPassword,
      role_id: roleUser.id,
      created_by: 'seed',
      updated_by: 'seed',
    },
  });

  // 3. Create court types: ALPHA and BETA
  const courtTypeAlpha = await prisma.masterCourtTypes.create({
    data: {
      name: 'ALPHA',
      price: 600000,
      created_by: 'seed',
      updated_by: 'seed',
    },
  });

  const courtTypeBeta = await prisma.masterCourtTypes.create({
    data: {
      name: 'BETA',
      price: 800000,
      created_by: 'seed',
      updated_by: 'seed',
    },
  });

  // 4. Create 3 master courts for ALPHA
  await prisma.masterCourts.createMany({
    data: [
      {
        name: 'Alpha Court 1',
        slug: slugify('Alpha Court 1', { lower: true }),
        court_type_id: courtTypeAlpha.id,
        created_by: 'seed',
        updated_by: 'seed',
      },
      {
        name: 'Alpha Court 2',
        slug: slugify('Alpha Court 2', { lower: true }),
        court_type_id: courtTypeAlpha.id,
        created_by: 'seed',
        updated_by: 'seed',
      },
      {
        name: 'Alpha Court 3',
        slug: slugify('Alpha Court 3', { lower: true }),
        court_type_id: courtTypeAlpha.id,
        created_by: 'seed',
        updated_by: 'seed',
      },
    ],
  });

  // 5. Create 2 master courts for BETA
  await prisma.masterCourts.createMany({
    data: [
      {
        name: 'Beta Court 1',
        slug: slugify('Beta Court 1', { lower: true }),
        court_type_id: courtTypeBeta.id,
        created_by: 'seed',
        updated_by: 'seed',
      },
      {
        name: 'Beta Court 2',
        slug: slugify('Beta Court 2', { lower: true }),
        court_type_id: courtTypeBeta.id,
        created_by: 'seed',
        updated_by: 'seed',
      },
    ],
  });

  console.log('✅ Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
