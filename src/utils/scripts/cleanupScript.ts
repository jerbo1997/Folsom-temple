import { PrismaClient } from '@prisma/client';

export async function cleanUp() {
  const prisma = new PrismaClient();
  const data = await prisma.serviceCalendar.findMany({
    where: {
      createdAt: { gt: '2024-01-27T00:00:00.000Z' },
      cartItems: {
        every: {
          cartId: null,
        },
      },
    },
    select: {
      id: true,
      cartItems: true,
    },
  });
  console.log(
    'cartItems>>>>',
    data.filter((it) => it.cartItems.length),
  );
  console.log('data>>>', data.length);
  const ids = data.map((it) => it.id);
  console.log('ids>>>>', ids);
  const deleted = await prisma.serviceCalendar.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  });
  console.log('deleted >>>', deleted.count);

  /* {
    id: 'clrvb28dh00trqoo2cz7dkomo',
    date: 2024-02-03T00:00:00.309Z,
    serviceId: 'clqqpjpap000ivjscnik7valh',
    isActive: true,
    createdAt: 2024-01-27T00:00:00.485Z,
    updatedAt: 2024-01-27T00:00:00.485Z
  },
  {
    id: 'clrvb28d400rhqoo2nlepkewf',
    date: 2024-02-11T00:00:00.309Z,
    serviceId: 'clqqpjp6r000gvjscdrpvdj47',
    isActive: true,
    createdAt: 2024-01-27T00:00:00.472Z,
    updatedAt: 2024-01-27T00:00:00.472Z
  } */
  prisma.$disconnect();
}
cleanUp();
