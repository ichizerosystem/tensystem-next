import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // 1. Create Tenant
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Demo Tenant',
    },
  });
  console.log('Created Tenant:', tenant.id);

  // 2. Create Office
  const office = await prisma.office.create({
    data: {
      name: 'Demo Office Tokyo',
      tenantId: tenant.id,
    },
  });
  console.log('Created Office:', office.id);

  // 3. Create Admin User
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      role: Role.ADMIN,
      officeId: office.id,
    },
  });
  console.log('Created Admin:', admin.email);

  // 4. Create Client
  const client = await prisma.client.create({
    data: {
      name: 'Sample Client T.S.',
      officeId: office.id,
    },
  });
  console.log('Created Client:', client.name);

  // 5. Create RecipientCertificate
  const cert = await prisma.recipientCertificate.create({
    data: {
      clientId: client.id,
      number: '1234567890',
      cityCode: '131016', // Chiyoda-ku
      validFrom: new Date('2025-04-01'),
      validTo: new Date('2026-03-31'),
      paymentCap: 37200,
    },
  });
  console.log('Created Certificate:', cert.number);

  // 6. Create ServiceContract
  const contract = await prisma.serviceContract.create({
    data: {
      clientId: client.id,
      serviceType: 'Commute', // 通所
      quantity: 22, // 支給量
      validFrom: new Date('2025-04-01'),
      validTo: new Date('2026-03-31'),
    },
  });
  console.log('Created Contract:', contract.serviceType);

  // 7. Addon Definitions
  await prisma.addonDefinition.createMany({
    data: [
      { name: 'Lunch', unitPrice: 600 },
      { name: 'Pickup', unitPrice: 500 },
    ],
  });
  console.log('Created Addon Definitions');

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
