import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { defaultSeedUser, getDatabaseUrl } from '../src/config/env';

const adapter = new PrismaPg({ connectionString: getDatabaseUrl() });
const prisma = new PrismaClient({ adapter });

async function main(): Promise<void> {
  const existingUser = await prisma.user.findFirst({
    orderBy: { email: 'asc' },
    select: { email: true, id: true },
  });

  if (existingUser) {
    console.log(
      `Seed skipped: using existing user ${existingUser.email} (${existingUser.id}).`,
    );
    return;
  }

  const user = await prisma.user.create({
    data: defaultSeedUser,
    select: { email: true, id: true },
  });

  console.log(`Seeded default user ${user.email} (${user.id}).`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
