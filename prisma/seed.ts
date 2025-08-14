import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.role.deleteMany();
  await prisma.user.deleteMany();
  await prisma.userSession.deleteMany();

  console.log('Seeding database...');

  // Create admin and user roles
  await prisma.role.createMany({
    data: [
      {
        name: 'Admin',
        slug: 'admin',
      },
      {
        name: 'User',
        slug: 'user',
      },
    ],
  });

  console.log('Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
