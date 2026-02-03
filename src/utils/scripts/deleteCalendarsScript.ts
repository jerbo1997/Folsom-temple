import { PrismaClient } from '@prisma/client';

export async function deleteCalendars() {
  const prisma = new PrismaClient();
  await prisma.serviceCalendar.deleteMany({
    where: {},
  });
  const orders = await prisma.order.findMany({
    where: { cart: { cartItems: { some: { serviceCalendarId: null } } } },
    include: { cart: true },
  });
  const orderIds = [];
  if (orders.length) {
    orders.forEach((it) => orderIds.push(it.id));
    for (const order of orders) {
      const cart = await prisma.cart.update({
        where: { id: order.cartId },
        data: { cartItems: { deleteMany: {} } },
      });
      await prisma.cart.delete({ where: { id: cart.id } });
    }
  }
  if (orderIds.length) {
    const order = await prisma.order.deleteMany({
      where: { id: { in: orderIds } },
    });
    if (order) {
      console.log('serviceCalendars deleted successfully ');
    }
  }
}
deleteCalendars();
