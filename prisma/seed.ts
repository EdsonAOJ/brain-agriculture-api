import { PrismaClient, RecordStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Prisma } from '@prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined.');
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log('Starting database seed...');

  await clearDatabase();

  const harvest2021 = await prisma.harvest.create({
    data: {
      name: 'Safra 2021',
      status: RecordStatus.ACTIVE,
    },
  });

  const harvest2022 = await prisma.harvest.create({
    data: {
      name: 'Safra 2022',
      status: RecordStatus.ACTIVE,
    },
  });

  const harvest2023 = await prisma.harvest.create({
    data: {
      name: 'Safra 2023',
      status: RecordStatus.ACTIVE,
    },
  });

  const soja = await prisma.crop.create({
    data: {
      name: 'Soja',
      status: RecordStatus.ACTIVE,
    },
  });

  const milho = await prisma.crop.create({
    data: {
      name: 'Milho',
      status: RecordStatus.ACTIVE,
    },
  });

  const cafe = await prisma.crop.create({
    data: {
      name: 'Café',
      status: RecordStatus.ACTIVE,
    },
  });

  const algodao = await prisma.crop.create({
    data: {
      name: 'Algodão',
      status: RecordStatus.ACTIVE,
    },
  });

  const producerOne = await prisma.producer.create({
    data: {
      document: '52998224725',
      documentType: 'CPF',
      name: 'João da Silva',
      status: RecordStatus.ACTIVE,
    },
  });

  const producerTwo = await prisma.producer.create({
    data: {
      document: '11222333000181',
      documentType: 'CNPJ',
      name: 'Agro Forte LTDA',
      status: RecordStatus.ACTIVE,
    },
  });

  const producerThree = await prisma.producer.create({
    data: {
      document: '93541134780',
      documentType: 'CPF',
      name: 'Maria Oliveira',
      status: RecordStatus.ACTIVE,
    },
  });

  const farmOne = await prisma.farm.create({
    data: {
      producerId: producerOne.id,
      name: 'Fazenda Boa Vista',
      city: 'Ribeirão Preto',
      state: 'SP',
      totalArea: new Prisma.Decimal(1000),
      agriculturalArea: new Prisma.Decimal(700),
      vegetationArea: new Prisma.Decimal(250),
      status: RecordStatus.ACTIVE,
    },
  });

  const farmTwo = await prisma.farm.create({
    data: {
      producerId: producerTwo.id,
      name: 'Fazenda Santa Clara',
      city: 'Sorriso',
      state: 'MT',
      totalArea: new Prisma.Decimal(2500),
      agriculturalArea: new Prisma.Decimal(1800),
      vegetationArea: new Prisma.Decimal(500),
      status: RecordStatus.ACTIVE,
    },
  });

  const farmThree = await prisma.farm.create({
    data: {
      producerId: producerTwo.id,
      name: 'Fazenda Primavera',
      city: 'Rio Verde',
      state: 'GO',
      totalArea: new Prisma.Decimal(1800),
      agriculturalArea: new Prisma.Decimal(1200),
      vegetationArea: new Prisma.Decimal(400),
      status: RecordStatus.ACTIVE,
    },
  });

  const farmFour = await prisma.farm.create({
    data: {
      producerId: producerThree.id,
      name: 'Sítio Esperança',
      city: 'Varginha',
      state: 'MG',
      totalArea: new Prisma.Decimal(600),
      agriculturalArea: new Prisma.Decimal(350),
      vegetationArea: new Prisma.Decimal(200),
      status: RecordStatus.ACTIVE,
    },
  });

  await prisma.plantedCrop.createMany({
    data: [
      {
        farmId: farmOne.id,
        harvestId: harvest2021.id,
        cropId: soja.id,
        status: RecordStatus.ACTIVE,
      },
      {
        farmId: farmOne.id,
        harvestId: harvest2021.id,
        cropId: milho.id,
        status: RecordStatus.ACTIVE,
      },
      {
        farmId: farmOne.id,
        harvestId: harvest2022.id,
        cropId: soja.id,
        status: RecordStatus.ACTIVE,
      },
      {
        farmId: farmTwo.id,
        harvestId: harvest2021.id,
        cropId: soja.id,
        status: RecordStatus.ACTIVE,
      },
      {
        farmId: farmTwo.id,
        harvestId: harvest2022.id,
        cropId: algodao.id,
        status: RecordStatus.ACTIVE,
      },
      {
        farmId: farmThree.id,
        harvestId: harvest2022.id,
        cropId: milho.id,
        status: RecordStatus.ACTIVE,
      },
      {
        farmId: farmThree.id,
        harvestId: harvest2023.id,
        cropId: soja.id,
        status: RecordStatus.ACTIVE,
      },
      {
        farmId: farmFour.id,
        harvestId: harvest2023.id,
        cropId: cafe.id,
        status: RecordStatus.ACTIVE,
      },
    ],
  });

  console.log('Database seed completed successfully.');
}

async function clearDatabase() {
  await prisma.plantedCrop.deleteMany();
  await prisma.farm.deleteMany();
  await prisma.producer.deleteMany();
  await prisma.crop.deleteMany();
  await prisma.harvest.deleteMany();
}

main()
  .catch((error) => {
    console.error('Database seed failed.', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
