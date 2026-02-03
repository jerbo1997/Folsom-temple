import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateCartDto } from './dto/update-cart.dto';
import { User } from 'src/user/user.model';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}
  async myCart(user: User) {
    let cart;
    cart = await this.prisma.cart.findFirst({
      where: { userId: user.id, checkout: false, isActive: true },
      include: {
        cartItems: {
          include: {
            serviceCalendar: { include: { service: true } },
            devotees: {
              select: { name: true, id: true, rasi: true, star: true },
            },
          },
        },
      },
    });
    if (!cart) {
      cart = await this.prisma.cart.create({
        data: {
          user: { connect: { id: user.id } },
        },
        include: { cartItems: true },
      });
    }
    let totalItemQty = 0;
    cart.cartItems?.forEach((it) => (totalItemQty += it.quantity));
    cart.totalItemsQty = totalItemQty;
    return cart;
  }

  async updateCart(cart, input: UpdateCartDto) {
    let familyMembers;
    if (input.devotees && input.devotees.length) {
      familyMembers = await this.prisma.familyMember.findMany({
        where: { id: { in: input.devotees }, userId: cart.userId },
      });
      if (input.devotees.length !== familyMembers.length) {
        throw new BadRequestException('Invalid family member Ids');
      }
    } else {
      familyMembers = await this.prisma.familyMember.findMany({
        where: { userId: cart.userId },
      });
    }
    const data: Prisma.CartUpdateInput = {};
    if (input.serviceCalendarId) {
      const serviceCalender = await this.prisma.serviceCalendar.findFirst({
        where: {
          id: input.serviceCalendarId,
          isActive: true,
        },
        include: {
          service: true,
        },
      });
      if (!serviceCalender) {
        throw new NotFoundException(
          'Cart updation failed invalid service provided',
        );
      }
      if (!cart.cartItems.length) {
        if (input.quantity !== 1) {
          throw new BadRequestException(
            'Cart updation failed invalid quantity provided',
          );
        }
        const itemAmount = input.quantity * serviceCalender.service.price;
        data.cartItems = {
          create: {
            price: parseFloat(serviceCalender.service.price.toFixed(2)),
            quantity: input.quantity,
            amount: parseFloat(itemAmount.toFixed(2)),
            serviceCalendarId: serviceCalender.id,
            devotees:
              familyMembers && familyMembers.length
                ? {
                    connect: familyMembers.map((it) => {
                      return { id: it.id };
                    }),
                  }
                : undefined,
          },
        };
        data.templeId = serviceCalender.service.templeId;
        data.amount = parseFloat(itemAmount.toFixed(2));
      } else {
        const existingItem = cart.cartItems.find(
          (it) => it.serviceCalendarId === input.serviceCalendarId,
        );
        if (existingItem) {
          const updatedQuantity = existingItem.quantity + input.quantity;
          if (cart.cartItems.length === 1) {
            if (input.quantity === 0 || updatedQuantity === 0) {
              return await this.remove(cart.id);
            } else {
              const currentAmount = existingItem.price * input.quantity;
              const amount = cart.amount + currentAmount;
              const cartItemAmount = existingItem.amount + currentAmount;
              data.cartItems = {
                update: {
                  where: { id: existingItem.id },
                  data: {
                    quantity: updatedQuantity,
                    amount: parseFloat(cartItemAmount.toFixed(2)),
                    devotees:
                      familyMembers && familyMembers.length
                        ? {
                            connect: familyMembers.map((it) => {
                              return { id: it.id };
                            }),
                          }
                        : undefined,
                  },
                },
              };
              data.amount = parseFloat(amount.toFixed(2));
            }
          } else {
            if (input.quantity === 0 || updatedQuantity === 0) {
              const amount = cart.amount - existingItem.amount;
              data.amount = parseFloat(amount.toFixed(2));
              data.cartItems = { delete: { id: existingItem.id } };
            } else {
              const currentAmount = existingItem.price * input.quantity;
              const cartItemAmount = existingItem.amount + currentAmount;
              data.cartItems = {
                update: {
                  where: { id: existingItem.id },
                  data: {
                    quantity: updatedQuantity,
                    amount: parseFloat(cartItemAmount.toFixed(2)),
                    devotees:
                      familyMembers && familyMembers.length
                        ? {
                            connect: familyMembers.map((it) => {
                              return { id: it.id };
                            }),
                          }
                        : undefined,
                  },
                },
              };
              const amount = Number(cart.amount) + Number(currentAmount);
              data.amount = parseFloat(amount.toFixed(2));
            }
          }
        } else {
          if (input.quantity !== 1) {
            throw new BadRequestException(
              'Cart updation failed invalid quantity provided',
            );
          }
          const itemAmount = input.quantity * serviceCalender.service.price;
          const amount = cart.amount + itemAmount;
          data.cartItems = {
            create: {
              price: parseFloat(serviceCalender.service.price.toFixed(2)),
              quantity: input.quantity,
              amount: parseFloat(itemAmount.toFixed(2)),
              serviceCalendarId: serviceCalender.id,
              devotees:
                familyMembers && familyMembers.length
                  ? {
                      connect: familyMembers.map((it) => {
                        return { id: it.id };
                      }),
                    }
                  : undefined,
            },
          };
          data.amount = parseFloat(amount.toFixed(2));
        }
      }
    }
    if (input.specialInstruction) {
      data.specialInstruction = input.specialInstruction;
    }
    const result: any = await this.prisma.cart.update({
      where: { id: cart.id },
      data,
      include: {
        cartItems: {
          include: {
            serviceCalendar: { include: { service: true } },
            devotees: {
              select: { name: true, id: true, rasi: true, star: true },
            },
          },
        },
      },
    });
    let totalItemQty = 0;
    result.cartItems?.forEach((it) => (totalItemQty += it.quantity));
    result.totalItemsQty = totalItemQty;
    return result;
  }

  async remove(id: string) {
    const cart = await this.prisma.cart.findUnique({ where: { id } });
    if (!cart) {
      throw new NotFoundException('cart not found');
    }
    const removeCart = await this.prisma.cart.update({
      where: { id },
      include: {
        cartItems: {
          include: { serviceCalendar: { include: { service: true } } },
        },
      },
      data: {
        amount: 0,
        templeId: null,
        cartItems: {
          deleteMany: {},
        },
      },
    });
    return {
      id: removeCart.id,
      amount: removeCart.amount,
      checkout: removeCart.checkout,
      totalItemsQty: 0,
      cartItems: [],
    };
  }
}
