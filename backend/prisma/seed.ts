import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial data...');

  const adminEmail = 'admin@pdfhub.local';

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const admin = await prisma.user.create({
      data: {
        fullName: 'System Admin',
        email: adminEmail,
        role: 'ADMIN',
      },
    });
    console.log(`Created admin user: ${admin.email}`);
  } else {
    console.log(`Admin user already exists: ${existingAdmin.email}`);
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
