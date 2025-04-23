import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.guest.create({
    data: {
      name: 'Initial Guest',
      addedBy: 'Admin',
    },
  });
  console.log('Guest seeded!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
