import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Plans (prices in micros)
  await prisma.plan.upsert({
    where: { code: 'starter' },
    update: {
      name: 'Starter',
      basePriceMicros: 29_990_000,
      pricePerSeatMicros: null,
      includedApiCalls: 1_000,
      isActive: true,
    },
    create: {
      code: 'starter',
      name: 'Starter',
      basePriceMicros: 29_990_000,
      pricePerSeatMicros: null,
      includedApiCalls: 1_000,
      isActive: true,
    },
  });

  await prisma.plan.upsert({
    where: { code: 'professional' },
    update: {
      name: 'Professional',
      basePriceMicros: 99_490_000,
      pricePerSeatMicros: 15_750_000,
      includedApiCalls: 10_000,
      isActive: true,
    },
    create: {
      code: 'professional',
      name: 'Professional',
      basePriceMicros: 99_490_000,
      pricePerSeatMicros: 15_750_000,
      includedApiCalls: 10_000,
      isActive: true,
    },
  });

  await prisma.plan.upsert({
    where: { code: 'enterprise' },
    update: {
      name: 'Enterprise',
      basePriceMicros: 299_900_000,
      pricePerSeatMicros: 12_300_000,
      includedApiCalls: 100_000,
      isActive: true,
    },
    create: {
      code: 'enterprise',
      name: 'Enterprise',
      basePriceMicros: 299_900_000,
      pricePerSeatMicros: 12_300_000,
      includedApiCalls: 100_000,
      isActive: true,
    },
  });

  // Promo codes (examples)
  await prisma.promoCode.upsert({
    where: { code: 'WELCOME10' },
    update: { discountType: 'PERCENT', percent: 10, amountMicros: null, isActive: true },
    create: { code: 'WELCOME10', discountType: 'PERCENT', percent: 10, amountMicros: null, isActive: true },
  });

  await prisma.promoCode.upsert({
    where: { code: 'SAVE5' },
    update: { discountType: 'FIXED', amountMicros: 5_000_000, percent: null, isActive: true },
    create: { code: 'SAVE5', discountType: 'FIXED', amountMicros: 5_000_000, percent: null, isActive: true },
  });

  // Admin user (for CRUD testing)
  // password: admin12345
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: { region: 'OTHER', role: 'ADMIN' },
    create: {
      email: 'admin@example.com',
      passwordHash: '$2b$10$4y8M9Q8lB0VfRXz4oQeWnO9CjzEw6H8jv2zqjQ6wS3h8m5Eo7w5wO',
      region: 'OTHER',
      role: 'ADMIN',
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

