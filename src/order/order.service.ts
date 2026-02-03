import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateAdminOrder,
  CreateInstantOrderDto,
  UpdateOrder,
} from './dto/create-order.dto';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { RazorPayService } from 'src/razor-pay/razor-pay.service';
import {
  CC_AVENUE,
  CREATED_VASTRAMS,
  DONATION,
  NEW_ORDER,
  OFFLINE_ORDER,
  ONLINE_ORDER,
  ORDER,
  PAYMENT_FAILURE,
  PAYMENT_SUCCESS,
  PENDING,
  ROLE_ADMIN,
  ROLE_USER,
  VASTRAM,
  WEBHOOK_FAILURE,
  WEBHOOK_SUCCESS,
} from 'src/const';
import {
  notification,
  notificationMessages,
  orderNo,
  waitFunction,
} from 'src/utils/helperFunction';
import { UserService } from 'src/user/user.service';
import { FirebaseService } from 'src/firebase/fireBase.service';
import { NotificationService } from 'src/notification/notification.service';
import { User } from 'src/user/user.model';
import { _OrderResponse } from 'src/utils/types/custom-types';
import { StripeService } from 'src/stripe/stripe.service';
@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly razorPayService: RazorPayService,
    private userService: UserService,
    private firebase: FirebaseService,
    private notificationService: NotificationService,
    private readonly stripeService: StripeService,
  ) {}

  async create(user: User, input: CreateAdminOrder) {
    // let razorpayOrder;
    let stripeOrder;
    const uniqueId = await orderNo(this.prisma);
    const cart = await this.prisma.cart.findFirst({
      where: { userId: user.id, checkout: false, isActive: true },
      include: { order: true, cartItems: true },
    });
    if (!cart) {
      throw new NotFoundException('Cart Not Found');
    }
    if (cart.cartItems && !cart.cartItems.length) {
      throw new BadRequestException('there is no item in your cart');
    }
    let newUser;
    let order;
    if (input.mobile) {
      const data = {
        firebase: { sign_in_provider: 'phone' },
        phone_number: `${input.countryCode}${input.mobile}`,
      };
      newUser = await this.userService.findOrCreateUser(
        data,
        input.countryCode,
      );
    }
    if (!input.isOfflineOrder) {
      // razorpayOrder = await this.razorPayService.createOrder(cart.amount);
      stripeOrder = await this.stripeService.createPaymentIntent(cart.amount);
    }
    if (cart.order) {
      const updateOrder: Prisma.OrderUpdateArgs = {
        where: {
          cartId: cart.id,
        },
        data: {
          orderId: stripeOrder?.id || null,
          // orderId: razorpayOrder?.orderId || null,
          // orderId: input.isOfflineOrder ? null : cart.order.orderId,
        },
        include: {
          cart: {
            include: {
              cartItems: {
                include: {
                  serviceCalendar: {
                    include: { service: { include: { imageUrl: true } } },
                  },
                },
              },
            },
          },
          payment: true,
        },
      };
      if (input.isOfflineOrder) {
        updateOrder.data.isOfflineOrder = input.isOfflineOrder;
        updateOrder.data.orderStatus = PAYMENT_SUCCESS;
      }
      if (input.specialInstruction) {
        await this.prisma.cart.update({
          where: { id: cart.id },
          data: {
            specialInstruction: input.specialInstruction,
          },
        });
      }
      order = await this.prisma.order.update(updateOrder);
    } else {
      const data: Prisma.OrderCreateInput = {
        amount: cart.amount,
        createdBy: { connect: { id: user.id } },
        orderId: stripeOrder?.id || null,
        /* commented as of now for razorpay integration */
        // orderId: razorpayOrder?.orderId || null,
        // orderId: input.isOfflineOrder ? null : uniqueId,
        orderNo: uniqueId,
        cart: { connect: { id: cart.id } },
        orderStatus: PENDING,
        inPersonVisit: input.inPerson,
      };
      if (input.inPerson) {
        const address = await this.prisma.address.findMany({
          where: { userId: user.id, isActive: true },
        });
        if (address.length) {
          data.address = { connect: { id: address[0].id } };
        } else {
          throw new NotFoundException(
            `You didn't add any address yet. please add address`,
          );
        }
      } else {
        if (input.addressId) {
          const address = await this.prisma.address.findUnique({
            where: { id: input.addressId },
          });
          if (!address) {
            throw new NotFoundException('Address not found');
          }
          data.address = { connect: { id: address.id } };
        }
      }
      if (input.specialInstruction) {
        await this.prisma.cart.update({
          where: { id: cart.id },
          data: {
            specialInstruction: input.specialInstruction,
          },
        });
      }
      if (input.isOfflineOrder) {
        data.isOfflineOrder = input.isOfflineOrder;
        data.orderStatus = WEBHOOK_SUCCESS;
      }
      if (input.mobile) {
        data.createdFor = { connect: { id: newUser.id } };
      }
      order = await this.prisma.order.create({
        data: data,
        include: {
          cart: {
            include: {
              cartItems: {
                include: {
                  serviceCalendar: {
                    include: { service: { include: { imageUrl: true } } },
                  },
                },
              },
            },
          },
          payment: true,
          createdBy: true,
          createdFor: true,
          address: true,
        },
      });
    }
    await this.prisma.cart.update({
      where: {
        id: order.cartId,
      },
      data: {
        checkout: true,
      },
    });

    let title;
    order.cart.cartItems?.forEach(
      (it) => (title = it.serviceCalendar.service.title),
    );
    if (input.isOfflineOrder) {
      await this.prisma.payment.create({
        data: {
          status: WEBHOOK_SUCCESS,
          mode: OFFLINE_ORDER,
          paymentMethod: input.mode,
          order: { connect: { id: order.id } },
        },
      });
    }
    if (!order.createdForId) {
      const admins = await this.userService.getUserTokens([
        { role: ROLE_ADMIN },
      ]);
      const adminNotification = notificationMessages(
        ORDER,
        NEW_ORDER,
        {
          title: title,
          userName: user.name,
        },
        ROLE_ADMIN,
      );
      if (admins.length) {
        notification(
          this.firebase,
          admins,
          adminNotification.title,
          adminNotification.body,
          ORDER,
          NEW_ORDER,
          order,
          this.notificationService,
          ROLE_ADMIN,
        );
      }
    }
    let users;
    if (order.createdForId) {
      users = await this.userService.getUserTokens([
        { role: ROLE_USER, includeUserIds: [order.createdForId] },
      ]);
    } else if (order.createdById && !order.createdForId) {
      users = await this.userService.getUserTokens([
        { role: ROLE_USER, includeUserIds: [order.createdById] },
      ]);
    }
    const userNotification = notificationMessages(
      ORDER,
      NEW_ORDER,
      {
        title: title,
      },
      ROLE_USER,
    );
    if (users.length) {
      notification(
        this.firebase,
        users,
        userNotification.title,
        userNotification.body,
        ORDER,
        NEW_ORDER,
        order,
        this.notificationService,
        ROLE_ADMIN,
      );
    }
    const updatedOrder: any = {};
    updatedOrder.id = order.id;
    updatedOrder.amount = order.amount;
    updatedOrder.orderId = order.orderId;
    updatedOrder.orderNo = order.orderNo;
    updatedOrder.orderStatus = order.orderStatus;
    updatedOrder.paymentId = order.paymentId;
    updatedOrder.paymentMethod = order.payment?.paymentMethod || null;
    updatedOrder.mode = order.payment?.mode || null;
    updatedOrder.inPersonVisit = order.inPersonVisit;
    updatedOrder.clientSecret = stripeOrder?.client_secret
      ? stripeOrder.client_secret
      : null;
    updatedOrder.address = order?.address || null;
    if (input.isOfflineOrder) {
      updatedOrder.paymentMethod = input.mode;
      updatedOrder.mode = OFFLINE_ORDER;
    }
    updatedOrder.createdBy = order.createdFor
      ? {
          id: order.createdFor.id,
          name: order.createdFor.name,
          gothram: order.createdFor.gothram,
          countryCode: order.createdFor.countryCode,
          mobile: order.createdFor.mobile,
          email: order.createdFor.email,
        }
      : {
          id: order.createdBy.id,
          name: order.createdBy.name,
          gothram: order.createdBy.gothram,
          countryCode: order.createdBy.countryCode,
          mobile: order.createdBy.mobile,
          email: order.createdBy.email,
        };
    //displaying createdBy value in createdFor
    updatedOrder.createdFor = {
      id: order.createdBy.id,
      name: order.createdBy.name,
      gothram: order.createdBy.gothram,
      countryCode: order.createdBy.countryCode,
      mobile: order.createdBy.mobile,
      email: order.createdBy.email,
    };
    updatedOrder.totalItemsQty = order.cart.cartItems.length;
    updatedOrder.cart = {
      id: order.cart.id,
      amount: order.cart.amount,
      specialInstruction: order.cart.specialInstruction || null,
      cartItems: [],
    };
    order.cart.cartItems?.forEach((menu) => {
      updatedOrder.cart.cartItems.push({
        id: menu.id,
        quantity: menu.quantity,
        amount: menu.amount,
        service: {
          id: menu.serviceCalendar.service.id,
          title: menu.serviceCalendar.service.title,
          description: menu.serviceCalendar.service.description || null,
          price: menu.serviceCalendar.service.price,
          currency: menu.serviceCalendar.service.currency,
          imageUrl: menu.serviceCalendar.service.imageUrl
            ? `${process.env.BASE_URL}/${menu.serviceCalendar.service.imageUrl.url}`
            : null,
          serviceCalendars: [
            { id: menu.serviceCalendar.id, date: menu.serviceCalendar.date },
          ],
        },
      });
    });
    updatedOrder.createdAt = order.createdAt;
    // updatedOrder.redirectUrl = process.env.CC_AVENUE_REDIRECT_URL;
    return updatedOrder;
  }

  async placeOrder(user: User, input: CreateInstantOrderDto, role: string) {
    let service;
    // let razorpayOrder;
    let stripeOrder;
    const data: Prisma.OrderCreateInput = {
      amount: 0,
      orderNo: '',
      orderId: '',
      createdBy: {
        connect: { id: user.id },
      },
      inPersonVisit: input.inPerson,
    };
    if (input.inPerson) {
      const address = await this.prisma.address.findMany({
        where: { userId: user.id, isActive: true },
      });
      if (address.length) {
        data.address = { connect: { id: address[0].id } };
      } else {
        throw new NotFoundException(
          `You didn't add any address yet. please add address`,
        );
      }
    } else {
      if (input.addressId) {
        const address = await this.prisma.address.findUnique({
          where: { id: input.addressId },
        });
        if (!address) {
          throw new NotFoundException('Address not found');
        }
        data.address = { connect: { id: address.id } };
      }
    }
    if (input.specialInstruction) {
      data.specialInstruction = input.specialInstruction;
    }
    let newUser;
    if (input.mobile) {
      const userData = {
        firebase: { sign_in_provider: 'phone' },
        phone_number: `${input.countryCode}${input.mobile}`,
      };
      newUser = await this.userService.findOrCreateUser(
        userData,
        input.countryCode,
      );
      data.createdFor = { connect: { id: newUser.id } };
      if (input.isOfflineOrder) {
        data.isOfflineOrder = input.isOfflineOrder;
      }
      if (input.star || input.gothram || input.rasi || input.name) {
        const familyMember = await this.prisma.familyMember.findFirst({
          where: { userId: newUser.id, isPrimary: true },
        });
        await this.prisma.user.update({
          where: { id: newUser.id },
          data: {
            star: input.star,
            rasi: input.rasi,
            gothram: input.gothram,
            name: input.name,
            familyMember: {
              upsert: {
                create: {
                  star: input.star,
                  rasi: input.rasi,
                  name: input.name,
                  isPrimary: true,
                },
                update: {
                  star: input.star,
                  rasi: input.rasi,
                  name: input.name,
                  isPrimary: true,
                },
                where: {
                  id: familyMember ? familyMember.id : '',
                  userId: newUser.id,
                  isPrimary: true,
                },
              },
            },
          },
        });
      }
    }
    //Flow for calendar event
    if (input.serviceCalendarId) {
      let familyMembers;
      // if (role === ROLE_USER) {
      if (input.devotees && input.devotees.length) {
        familyMembers = await this.prisma.familyMember.findMany({
          where: {
            id: { in: input.devotees },
            userId: newUser ? newUser.id : user.id,
          },
        });
        if (input.devotees.length !== familyMembers.length) {
          throw new BadRequestException('Invalid family member Ids');
        }
      } else {
        familyMembers = await this.prisma.familyMember.findMany({
          where: { userId: newUser ? newUser.id : user.id },
        });
      }
      // }
      if (input.amount) {
        throw new BadRequestException(`Provide amount for Donation`);
      }
      service = await this.prisma.service.findUnique({
        where: {
          id: input.serviceId,
          serviceCalendar: { some: { id: input.serviceCalendarId } },
          isActive: true,
        },
      });
      if (!service) {
        throw new NotFoundException('Service not found');
      }
      //razorpay
      if (!input.isOfflineOrder) {
        // razorpayOrder = await this.razorPayService.createOrder(service.price);
        stripeOrder = await this.stripeService.createPaymentIntent(
          service.price,
        );
      }
      data.amount = service.price;
      data.isInstantOrder = true;

      data.cart = {
        create: {
          amount: service.price,
          checkout: true,
          templeId: service.templeId,
          specialInstruction: input.specialInstruction || null,
          user: { connect: { id: user.id } },
          cartItems: {
            create: {
              price: parseFloat(service.price.toFixed(2)),
              quantity: 1,
              amount: parseFloat(service.price.toFixed(2)),
              serviceCalendarId: input.serviceCalendarId,
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
        },
      };
    } else {
      //Flow for donation
      const service = await this.prisma.service.findUnique({
        where: {
          id: input.serviceId,
          isActive: true,
        },
        include: { ServiceType: true },
      });

      if (!service) {
        throw new NotFoundException('Service not found');
      }
      if (!input.amount && service.ServiceType.type === DONATION) {
        throw new BadRequestException(`Please provide amount for Donation.`);
      }
      if (input.amount) {
        if (service.ServiceType.type === DONATION && service.config) {
          const config = service.config as Prisma.JsonObject;
          if (config.isEditable) {
            if (
              input.amount < Number(config.minAmount) ||
              input.amount > Number(config.maxAmount)
            ) {
              throw new BadRequestException(
                'Donation should not be differ from the limit',
              );
            }
          } else {
            if (
              input.amount < Number(config.minAmount) ||
              input.amount > Number(config.maxAmount)
            ) {
              throw new BadRequestException(
                'Donation should not be differ from the limit',
              );
            }
          }
        } else {
          throw new BadRequestException('There is no config in this service');
        }
      }
      data.service = { connect: { id: service.id } };

      //razorpay
      if (!input.isOfflineOrder) {
        // razorpayOrder = await this.razorPayService.createOrder(input.amount);
        stripeOrder = await this.stripeService.createPaymentIntent(
          input.amount,
        );
      }
      data.amount = input.amount;
      if (service.ServiceType.type === VASTRAM) {
        data.additionalInfo = {
          date: input.date,
          value: input.value || null,
        };
        data.amount = parseInt(input.value);
      }
    }

    const uniqueNo = await orderNo(this.prisma);
    data.orderNo = uniqueNo;
    //razorpay order change
    // data.orderId = razorpayOrder ? razorpayOrder.orderId : null;
    data.orderId = stripeOrder ? stripeOrder.id : null;
    data.orderStatus = PENDING;
    let order;
    order = await this.prisma.order.create({
      data: data,
      include: {
        service: { include: { imageUrl: true } },
        payment: true,
        createdBy: true,
        createdFor: true,
        address: true,
        cart: {
          include: {
            cartItems: {
              include: {
                serviceCalendar: {
                  include: { service: { include: { imageUrl: true } } },
                },
              },
            },
          },
        },
      },
    });
    if (input.isOfflineOrder) {
      data.orderStatus = WEBHOOK_SUCCESS;
      if (input.serviceCalendarId && input.serviceId) {
        data.payment = {
          create: {
            amount: service.price,
            mode: OFFLINE_ORDER,
            paymentMethod: input.mode,
            status: WEBHOOK_SUCCESS,
          },
        };
      } else if (input.serviceId && input.amount) {
        data.payment = {
          create: {
            amount: input.amount,
            mode: OFFLINE_ORDER,
            paymentMethod: input.mode,
            status: WEBHOOK_SUCCESS,
          },
        };
      } else {
        data.payment = {
          create: {
            mode: OFFLINE_ORDER,
            paymentMethod: input.mode,
            status: WEBHOOK_SUCCESS,
          },
        };
      }
      order = await this.prisma.order.update({
        where: { id: order.id },
        data,
        include: {
          service: { include: { imageUrl: true } },
          payment: true,
          createdBy: true,
          createdFor: true,
          address: true,
          cart: {
            include: {
              cartItems: {
                include: {
                  serviceCalendar: {
                    include: { service: { include: { imageUrl: true } } },
                  },
                },
              },
            },
          },
        },
      });
    }
    if (!order.createdForId) {
      const admins = await this.userService.getUserTokens([
        { role: ROLE_ADMIN },
      ]);
      if (order.service) {
        const adminNotification = notificationMessages(
          ORDER,
          NEW_ORDER,
          {
            title: order.service.title,
            userName: user.name,
          },
          ROLE_ADMIN,
        );
        if (admins.length) {
          notification(
            this.firebase,
            admins,
            adminNotification.title,
            adminNotification.body,
            ORDER,
            NEW_ORDER,
            order,
            this.notificationService,
            ROLE_ADMIN,
          );
        }
      }
    }
    let users;
    if (order.createdForId) {
      users = await this.userService.getUserTokens([
        { role: ROLE_USER, includeUserIds: [order.createdForId] },
      ]);
    } else if (order.createdById && !order.createdForId) {
      users = await this.userService.getUserTokens([
        { role: ROLE_USER, includeUserIds: [order.createdById] },
      ]);
    }
    if (order.cart) {
      const userNotification = notificationMessages(
        ORDER,
        NEW_ORDER,
        {
          title: order.cart.cartItems[0].serviceCalendar.service.title,
        },
        ROLE_USER,
      );
      if (users.length) {
        notification(
          this.firebase,
          users,
          userNotification.title,
          userNotification.body,
          ORDER,
          NEW_ORDER,
          order,
          this.notificationService,
          ROLE_ADMIN,
        );
      }
    }
    const orderOrDonation: any = {
      id: order.id,
      amount: order.amount,
      orderNo: order.orderNo,
      orderId: order.orderId || null,
      orderStatus: order.orderStatus,
      paymentId: order.paymentId,
      mode: order.payment ? order.payment.mode : ONLINE_ORDER,
      additionalInfo: order.additionalInfo,
      paymentMethod: order.payment?.paymentMethod || null,
      totalItemsQty: 1,
      inPersonVisit: order.inPersonVisit,
      address: order?.address || null,
      clientSecret: stripeOrder?.client_secret
        ? stripeOrder.client_secret
        : null,
    };
    orderOrDonation.createdBy = order.createdFor
      ? {
          id: order.createdFor.id,
          name: order.createdFor.name,
          gothram: order.createdFor.gothram,
          countryCode: order.createdFor.countryCode,
          mobile: order.createdFor.mobile,
          email: order.createdFor.email,
        }
      : {
          id: order.createdBy.id,
          name: order.createdBy.name,
          gothram: order.createdBy.gothram,
          countryCode: order.createdBy.countryCode,
          mobile: order.createdBy.mobile,
          email: order.createdBy.email,
        };
    //displaying createdBy value in createdFor
    orderOrDonation.createdFor = {
      id: order.createdBy.id,
      name: order.createdBy.name,
      gothram: order.createdBy.gothram,
      countryCode: order.createdBy.countryCode,
      mobile: order.createdBy.mobile,
      email: order.createdBy.email,
    };
    if (order.service) {
      orderOrDonation.cart = {
        specialInstruction: order?.specialInstruction || null,
        cartItems: [
          {
            service: {
              id: order.service.id,
              title: order.service.title,
              description: order.service.description || null,
              imageUrl: order.service.imageUrl
                ? `${process.env.BASE_URL}/${order.service.imageUrl.url}`
                : null,
              serviceCalendars: [
                {
                  date: input?.date || null,
                },
              ],
            },
          },
        ],
      };
      orderOrDonation.createdAt = order.createdAt;
    } else {
      orderOrDonation.cart = {
        specialInstruction: order?.specialInstruction || null,
        cartItems: [
          {
            service: {
              id: order.cart.cartItems[0].serviceCalendar.service.id,
              title: order.cart.cartItems[0].serviceCalendar.service.title,
              description:
                order.cart.cartItems[0].serviceCalendar.service.description ||
                null,
              price: order.cart.cartItems[0].serviceCalendar.service.price,
              imageUrl: order.cart.cartItems[0].serviceCalendar.service.imageUrl
                ? `${process.env.BASE_URL}/${order.cart.cartItems[0].serviceCalendar.service.imageUrl.url}`
                : null,
              serviceCalendars: [
                {
                  id: order.cart.cartItems[0].serviceCalendar.id,
                  date: order.cart.cartItems[0].serviceCalendar.date,
                },
              ],
            },
          },
        ],
      };
      orderOrDonation.createdAt = order.createdAt;
      // orderOrDonation.redirectUrl = process.env.CC_AVENUE_REDIRECT_URL;
    }
    return orderOrDonation;
  }

  async findAll(
    user: User,
    status: string,
    type: string,
    startDate: string,
    endDate: string,
    role: string,
    screenName: string,
  ) {
    try {
      const whereCondition: Prisma.OrderWhereInput = {
        isActive: true,
      };
      const userData = await this.prisma.user.findUnique({
        where: { id: user.id },
        include: { role: true },
      });
      if (!userData) {
        throw new NotFoundException('User not found');
      }
      if (!screenName) {
        whereCondition.createdById = userData.id;
      }
      if (status === WEBHOOK_SUCCESS) {
        whereCondition.orderStatus = WEBHOOK_SUCCESS;
      } else if (status === WEBHOOK_FAILURE) {
        whereCondition.orderStatus = { in: [WEBHOOK_FAILURE, PENDING] };
      }
      let endTime;
      let startTime;
      if (startDate && endDate) {
        const endDateTime = new Date(endDate).toISOString().slice(0, 10);
        endTime = new Date(`${endDateTime} 23:59:59.999`);
        const starttDateTime = new Date(startDate).toISOString().slice(0, 10);
        startTime = new Date(`${starttDateTime} 00:00:00.000`);
        whereCondition.createdAt = {
          gte: startTime,
          lte: endTime,
        };
      }
      const orders = await this.prisma.order.findMany({
        where: whereCondition,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: { include: { role: true } },
          createdFor: true,
          cart: {
            include: {
              cartItems: {
                include: {
                  devotees: true,
                  serviceCalendar: {
                    include: { service: { include: { imageUrl: true } } },
                  },
                },
              },
            },
          },
          service: { include: { ServiceType: true, imageUrl: true } },
          payment: true,
          address: true,
        },
      });
      const updatedOrders = [];
      for (const it of orders) {
        //temporary bug fix
        if (
          (!it.cart && !it.serviceId) ||
          (it.cart &&
            it.cart.cartItems.filter((data) => !data.serviceCalendarId).length)
        ) {
          // temporary error handling incase of removing any service
          continue;
        }
        let familyMembers = null;
        if (
          it.createdBy.role.name === ROLE_USER ||
          (it.createdBy.role.name === ROLE_ADMIN && it.createdForId)
        ) {
          familyMembers = await this.prisma.familyMember.findMany({
            where: {
              userId:
                it.createdBy.role.name === ROLE_USER
                  ? it.createdBy.id
                  : it.createdForId,
            },
            select: { name: true, rasi: true, star: true },
          });
        }
        const order: any = {
          id: it.id,
          amount: it?.amount || null,
          orderId: it.orderId || null,
          orderNo: it.orderNo,
          orderStatus: it.orderStatus,
          paymentId: it.paymentId,
          mode: it.payment?.mode || null,
          additionalInfo: it?.additionalInfo,
          paymentMethod: it.payment?.paymentMethod || null,
          inPersonVisit: it.inPersonVisit,
          createdAt: it.createdAt,
          address: it?.address || null,
          familyMembers: familyMembers,
        };
        order.createdBy = it.createdFor
          ? {
              id: it.createdFor.id,
              name: it.createdFor.name,
              gothram: it.createdFor.gothram,
              countryCode: it.createdFor.countryCode,
              mobile: it.createdFor.mobile,
              email: it.createdFor?.email || null,
            }
          : {
              id: it.createdBy.id,
              name: it.createdBy.name,
              gothram: it.createdBy.gothram,
              countryCode: it.createdBy.countryCode,
              mobile: it.createdBy.mobile,
              email: it.createdBy?.email || null,
            };
        //displaying createdBy value in createdFor
        order.createdFor = {
          id: it.createdBy.id,
          name: it.createdBy.name,
          gothram: it.createdBy.gothram,
          countryCode: it.createdBy.countryCode,
          mobile: it.createdBy.mobile,
          email: it.createdBy?.email || null,
        };
        if (it.cart) {
          //normal order
          order.cart = {
            id: it.cart.id,
            amount: it.cart.amount,
            specialInstruction: it.cart.specialInstruction
              ? it.cart.specialInstruction
              : null,
            cartItems: [],
          };
          order.totalItemsQty = it.cart.cartItems.length;
          it.cart.cartItems?.forEach((menu) => {
            order.cart.cartItems.push({
              id: menu.id,
              quantity: menu.quantity,
              amount: menu.amount,
              service: {
                id: menu.serviceCalendar.service.id,
                title: menu.serviceCalendar.service.title,
                description: menu.serviceCalendar.service.description || null,
                price: menu.serviceCalendar.service.price,
                currency: menu.serviceCalendar.service.currency,
                imageUrl: menu.serviceCalendar.service.imageUrl
                  ? `${process.env.BASE_URL}/${menu.serviceCalendar.service.imageUrl.url}`
                  : null,
                serviceCalendars: [
                  {
                    id: menu.serviceCalendar.id,
                    date: menu.serviceCalendar.date,
                  },
                ],
              },
              devotees:
                menu.devotees && menu.devotees.length
                  ? menu.devotees.map((it) => {
                      return {
                        id: it.id,
                        name: it.name,
                        rasi: it.rasi,
                        star: it.star,
                      };
                    })
                  : null,
            });
          });
        } else {
          order.totalItemsQty = 1;
          order.cart = {
            specialInstruction: it.specialInstruction
              ? it.specialInstruction
              : null,
            cartItems: [],
          };
          //donations
          if (it.service.ServiceType.type === VASTRAM) {
            const info = it?.additionalInfo as Prisma.JsonObject;
            order.cart.cartItems.push({
              devotees: null,
              service: {
                id: it.service.id,
                title: it.service.title,
                description: it.service.description || null,
                imageUrl: it.service.imageUrl
                  ? `${process.env.BASE_URL}/${it.service.imageUrl.url}`
                  : null,
              },
            });
          }
          if (it.service.ServiceType.type === DONATION) {
            order.cart.cartItems.push({
              devotees: null,
              service: {
                id: it.service.id,
                title: it.service.title,
                description: it.service.description || null,
                imageUrl: it.service.imageUrl
                  ? `${process.env.BASE_URL}/${it.service.imageUrl.url}`
                  : null,
              },
            });
          }
        }
        updatedOrders.push(order);
      }
      const donations = [];
      const generalOrders = [];
      updatedOrders.forEach((it) => {
        if (!it.cart.cartItems[0].service.serviceCalendars) {
          if (screenName) {
            if (it.additionalInfo === null) {
              donations.push(it);
            }
          } else {
            donations.push(it);
          }
        } else {
          generalOrders.push(it);
        }
      });
      if (type === DONATION) {
        return donations;
      } else {
        return generalOrders;
      }
    } catch (error) {
      console.log('Get all error >>>', error);
    }
  }

  async getOrdersCount(
    currentUser: User,
    startDate: string,
    endDate: string,
    status: string,
    type: string,
  ) {
    const whereCondition: Prisma.OrderWhereInput = { isActive: true };
    const user = await this.prisma.user.findUnique({
      where: { id: currentUser.id },
      include: { role: true },
    });
    if (user.role.name === ROLE_USER) {
      whereCondition.createdById = user.id;
    }
    if (status === WEBHOOK_SUCCESS) {
      whereCondition.orderStatus = WEBHOOK_SUCCESS;
    } else {
      whereCondition.orderStatus = { in: [WEBHOOK_FAILURE, PENDING] };
    }
    const currentDateTime = new Date().toISOString().slice(0, 10);
    const todayEndTime = new Date(`${currentDateTime} 23:59:59.999`);
    let endTime;
    let startTime;
    if (startDate) {
      const starttDateTime = new Date(startDate).toISOString().slice(0, 10);
      startTime = new Date(`${starttDateTime} 00:00:00.000`);
    }
    if (endDate) {
      const endDateTime = new Date(endDate).toISOString().slice(0, 10);
      endTime = new Date(`${endDateTime} 23:59:59.999`);
    }
    if (startDate && endDate) {
      whereCondition.createdAt = {
        gte: startTime,
        lte: endTime,
      };
    } else if (startDate) {
      whereCondition.createdAt = {
        gte: startTime,
        lte: todayEndTime,
      };
    } else {
      whereCondition.createdAt = {
        lte: endTime,
      };
    }
    const orders = await this.prisma.order.findMany({
      where: whereCondition,
      include: {
        cart: {
          include: {
            cartItems: {
              include: {
                serviceCalendar: {
                  include: { service: true },
                },
              },
            },
          },
        },
        service: { include: { ServiceType: true } },
      },
    });
    const updatedOrders = [];
    orders.forEach((it) => {
      const order: any = {
        id: it.id,
        amount: it.amount,
        orderId: it.orderId,
        orderNo: it.orderNo,
        orderStatus: it.orderStatus,
        paymentId: it.paymentId,
        inPerson: it.inPersonVisit,
        createdAt: it.createdAt,
      };
      if (it.cart) {
        order.cart = {
          id: it.cart.id,
          amount: it.cart.amount,
          cartItems: [],
        };
        it.cart.cartItems?.forEach((menu) => {
          order.cart.cartItems.push({
            id: menu.id,
            quantity: menu.quantity,
            amount: menu.amount,
            service: {
              id: menu.serviceCalendar.service.id,
              title: menu.serviceCalendar.service.title,
              price: menu.serviceCalendar.service.price,
              currency: menu.serviceCalendar.service.currency,
              serviceCalendars: [
                {
                  id: menu.serviceCalendar.id,
                  date: menu.serviceCalendar.date,
                },
              ],
            },
          });
        });
      } else {
        //donations
        order.totalItemsQty = 1;
        if (it.service.ServiceType.type === VASTRAM) {
          const info = it.additionalInfo as Prisma.JsonObject;
          order.cart = {
            specialInstruction: it.specialInstruction
              ? it.specialInstruction
              : null,
            cartItems: [
              {
                service: {
                  id: it.service.id,
                  title: it.service.title,
                  serviceCalendars: [
                    {
                      date: info.date,
                    },
                  ],
                },
              },
            ],
          };
        }
        order.cart = {
          specialInstruction: it.specialInstruction
            ? it.specialInstruction
            : null,
          cartItems: [
            {
              service: {
                id: it.service.id,
                title: it.service.title,
              },
            },
          ],
        };
      }
      updatedOrders.push(order);
    });
    const donations = [];
    const generalOrders = [];
    updatedOrders.forEach((it) => {
      if (!it.cart.id && it.cart.cartItems.some((it) => it.service)) {
        donations.push(it);
      } else {
        generalOrders.push(it);
      }
    });
    let ordersCount;
    if (type === DONATION) {
      ordersCount = {
        ordersCount: donations.length,
      };
    } else {
      ordersCount = {
        ordersCount: generalOrders.length,
      };
    }
    return ordersCount;
  }

  async getAllOrdersCount(
    currentUser: User,
    startDate: string,
    endDate: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: currentUser.id, isActive: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const whereCondition: Prisma.OrderWhereInput = { isActive: true };
    const bookingWhereCondition: Prisma.OrderWhereInput = { isActive: true };
    /*let currentDateTime = new Date().toISOString().slice(0, 10);
    let todayEndTime = new Date(`${currentDateTime} 23:59:59.999`);*/
    let endTime;
    let startTime;
    if (startDate && endDate) {
      const starttDateTime = new Date(startDate).toISOString().slice(0, 10);
      startTime = new Date(`${starttDateTime} 00:00:00.000`);
      const endDateTime = new Date(endDate).toISOString().slice(0, 10);
      endTime = new Date(`${endDateTime} 23:59:59.999`);
      whereCondition.createdAt = {
        gte: startTime,
        lte: endTime,
      };
      bookingWhereCondition.cart = {
        cartItems: {
          some: {
            serviceCalendar: {
              date: {
                gte: startTime,
                lte: endTime,
              },
            },
          },
        },
      };
    } /*else if (startDate) {
      whereCondition.createdAt = {
        gte: startTime,
        lte: todayEndTime,
      };
      bookingWhereCondition.cart = {
        cartItems: {
          some: {
            serviceCalendar: {
              date: {
                gte: startTime,
                lte: todayEndTime,
              }
            }
          }
        }
      }
    } else {
      whereCondition.createdAt = {
        lte: endTime,
      };
      bookingWhereCondition.cart = {
        cartItems: {
          some: {
            serviceCalendar: {
              date: {
                lte: endTime,
              }
            }
          }
        }
      }
    }*/
    bookingWhereCondition.orderStatus = WEBHOOK_SUCCESS;
    const bookings = await this.prisma.order.findMany({
      where: bookingWhereCondition,
    });
    const orders = await this.prisma.order.findMany({
      where: whereCondition,
    });
    const allOrders = [];
    orders?.forEach((it) => {
      allOrders.push(it.id);
    });
    const donationOrders = await this.prisma.order.groupBy({
      where: {
        id: { in: allOrders },
        orderStatus: { in: ['Success', 'Failure', 'Pending'] },
        cartId: null,
        service: { ServiceType: { type: DONATION } },
      },
      by: ['orderStatus', 'serviceId'],
      _count: true,
    });
    const genericOrders = await this.prisma.order.groupBy({
      where: {
        id: { in: allOrders },
        orderStatus: { in: ['Success', 'Failure', 'Pending'] },
        cartId: null,
        service: {
          ServiceType: { type: { not: { in: [DONATION, VASTRAM] } } },
        },
      },
      by: ['orderStatus', 'serviceId'],
      _count: true,
    });
    const eventOrders = await this.prisma.order.groupBy({
      where: {
        id: { in: allOrders },
        orderStatus: { in: ['Success', 'Failure', 'Pending'] },
        serviceId: null,
      },
      by: ['orderStatus', 'serviceId'],
      _count: true,
    });
    const combinedOrders = genericOrders.concat(eventOrders);
    const ordersCounts = {
      orderSuccessCount: 0,
      orderFailureCount: 0,
      donationSuccessCount: 0,
      donationFailureCount: 0,
      bookingsCount: 0,
    };
    if (bookings && bookings.length) {
      ordersCounts.bookingsCount = bookings.length;
    }
    donationOrders.forEach((it) => {
      const { _count, orderStatus, serviceId } = it;
      if (orderStatus === WEBHOOK_SUCCESS) {
        ordersCounts.donationSuccessCount += _count;
      }
      if (orderStatus === WEBHOOK_FAILURE || orderStatus === PENDING) {
        ordersCounts.donationFailureCount += _count;
      }
    });
    combinedOrders.forEach((order) => {
      const { _count, orderStatus, serviceId } = order;
      if (orderStatus === WEBHOOK_SUCCESS) {
        ordersCounts.orderSuccessCount += _count;
      }
      if (orderStatus === WEBHOOK_FAILURE || orderStatus === PENDING) {
        ordersCounts.orderFailureCount += _count;
      }
    });
    return ordersCounts;
  }

  async findOne(id: string, user?: User) {
    const whereCondition: Prisma.OrderWhereUniqueInput = { id };
    const userData = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: { role: true },
    });
    if (userData.role.name === ROLE_USER) {
      whereCondition.createdById = user.id;
    }
    const order = await this.prisma.order.findUnique({
      where: whereCondition,
      include: {
        cart: {
          include: {
            cartItems: {
              include: {
                serviceCalendar: {
                  include: { service: { include: { imageUrl: true } } },
                },
              },
            },
          },
        },
        service: { include: { ServiceType: true, imageUrl: true } },
        payment: true,
      },
    });
    if (!order) {
      throw new NotFoundException('order not found');
    }
    const updatedOrder: any = {
      id: order.id,
      amount: order.amount,
      orderId: order.orderId,
      orderNo: order.orderNo,
      orderStatus: order.orderStatus,
      paymentId: order.paymentId,
      mode: order.payment?.mode || null,
      additionalInfo: order.additionalInfo,
      paymentMethod: order.payment?.paymentMethod || null,
      createdAt: order.createdAt,
    };
    if (order.cart) {
      updatedOrder.cart = {
        id: order.cart.id,
        amount: order.cart.amount,
        cartItems: [],
      };
      order.cart.cartItems?.forEach((menu) => {
        updatedOrder.cart.cartItems.push({
          id: menu.id,
          quantity: menu.quantity,
          amount: menu.amount,
          service: {
            id: menu.serviceCalendar.service.id,
            title: menu.serviceCalendar.service.title,
            description: menu.serviceCalendar.service.description || null,
            price: menu.serviceCalendar.service.price,
            currency: menu.serviceCalendar.service.currency,
            imageUrl: menu.serviceCalendar.service.imageUrl
              ? `${process.env.BASE_URL}/${menu.serviceCalendar.service.imageUrl.url}`
              : null,
            serviceCalendars: [
              { id: menu.serviceCalendar.id, date: menu.serviceCalendar.date },
            ],
          },
        });
      });
    } else {
      //donations
      updatedOrder.totalItemsQty = 1;
      if (order.service.ServiceType.type === VASTRAM) {
        const info = order.additionalInfo as Prisma.JsonObject;
        updatedOrder.cart = {
          specialInstruction: order.specialInstruction
            ? order.specialInstruction
            : null,
          cartItems: [
            {
              service: {
                id: order.service.id,
                title: order.service.title,
                description: order.service.description || null,
                imageUrl: order.service.imageUrl
                  ? `${process.env.BASE_URL}/${order.service.imageUrl.url}`
                  : null,
                serviceCalendars: [
                  {
                    date: info.date,
                  },
                ],
              },
            },
          ],
        };
      }
      updatedOrder.cart = {
        specialInstruction: order.specialInstruction
          ? order.specialInstruction
          : null,
        cartItems: [
          {
            service: {
              id: order.service.id,
              title: order.service.title,
              description: order.service.description || null,
              imageUrl: order.service.imageUrl
                ? `${process.env.BASE_URL}/${order.service.imageUrl.url}`
                : null,
            },
          },
        ],
      };
    }
    return updatedOrder;
  }

  async orderWebhook(data: UpdateOrder) {
    const order = await this.prisma.order.findUnique({
      where: {
        orderId: data.id,
      },
      include: { cart: true },
    });
    if (!order) {
      throw new NotFoundException('Order Not Found');
    }
    const updateData: Prisma.OrderUpdateInput = {};
    if (data.event === PAYMENT_SUCCESS) {
      updateData.orderStatus = WEBHOOK_SUCCESS;
    } else if (data.event === PAYMENT_FAILURE) {
      updateData.orderStatus = WEBHOOK_FAILURE;
    }
    if (order.paymentId) {
      updateData.payment = {
        update: {
          amount: data.amount,
          paymentId: data.paymentId,
          paymentMethod: data.paymentMethod,
          status: String(updateData.orderStatus),
        },
      };
    } else {
      updateData.payment = {
        create: {
          amount: data.amount,
          paymentId: data.paymentId,
          paymentMethod: data.paymentMethod,
          status: String(updateData.orderStatus),
        },
      };
    }
    await this.prisma.order.update({
      where: { orderId: data.id },
      data: updateData,
    });
  }

  async events(user: User, status: string, startDate: string, endDate: string) {
    const whereCondition: Prisma.OrderWhereInput = { isActive: true };
    const userData = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: { role: true },
    });
    if (!userData) {
      throw new NotFoundException('User not found');
    }
    if (status === WEBHOOK_SUCCESS) {
      whereCondition.orderStatus = WEBHOOK_SUCCESS;
    } else if (status === WEBHOOK_FAILURE) {
      whereCondition.orderStatus = { in: [WEBHOOK_FAILURE, PENDING] };
    }
    const cartItemsCondition: Prisma.Cart$cartItemsArgs = {
      include: {
        devotees: {
          select: { id: true, name: true, rasi: true, star: true },
        },
        serviceCalendar: {
          include: { service: { include: { imageUrl: true } } },
        },
      },
    };
    if (startDate && endDate) {
      let endTime;
      let startTime;
      startTime = new Date(startDate);
      startTime.setHours(0, 0, 0, 0);
      endTime = new Date(endDate);
      endTime.setHours(23, 59, 59, 999);
      whereCondition.cart = {
        cartItems: {
          some: {
            serviceCalendar: { date: { gte: startTime, lte: endTime } },
          },
        },
      };
      cartItemsCondition.where = whereCondition.cart.cartItems.some;
    }
    const orders = await this.prisma.order.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { include: { role: true } },
        createdFor: true,
        cart: {
          include: {
            cartItems: cartItemsCondition,
          },
        },
        service: { include: { ServiceType: true } },
        payment: true,
        address: true,
      },
    });
    const updatedOrders = [];
    for (const it of orders) {
      let familyMembers = null;
      if (
        (it.createdBy && it.createdBy.role.name === ROLE_USER) ||
        (it.createdBy &&
          it.createdBy.role.name === ROLE_ADMIN &&
          it.createdForId)
      ) {
        familyMembers = await this.prisma.familyMember.findMany({
          where: {
            userId:
              it.createdBy.role.name === ROLE_USER
                ? it.createdBy.id
                : it.createdForId,
          },
          select: { name: true, rasi: true, star: true },
        });
      }
      if (!it.cart) {
        return;
      }
      const order: any = {
        id: it.id,
        amount: it?.amount || null,
        orderId: it.orderId || null,
        orderNo: it.orderNo,
        orderStatus: it.orderStatus,
        paymentId: it.paymentId,
        mode: it.payment?.mode || null,
        additionalInfo: it?.additionalInfo,
        paymentMethod: it.payment?.paymentMethod || null,
        inPersonVisit: it.inPersonVisit,
        createdAt: it.createdAt,
        address: it?.address || null,
        familyMembers: familyMembers,
      };
      order.createdBy = it.createdFor
        ? {
            id: it.createdFor.id,
            name: it.createdFor.name,
            gothram: it.createdFor.gothram,
            countryCode: it.createdFor.countryCode,
            mobile: it.createdFor.mobile,
            email: it.createdFor.email,
          }
        : {
            id: it.createdBy.id,
            name: it.createdBy.name,
            gothram: it.createdBy.gothram,
            countryCode: it.createdBy.countryCode,
            mobile: it.createdBy.mobile,
            email: it.createdBy.email,
          };
      //displaying createdBy value in createdFor
      order.createdFor = {
        id: it.createdBy.id,
        name: it.createdBy.name,
        gothram: it.createdBy.gothram,
        countryCode: it.createdBy.countryCode,
        mobile: it.createdBy.mobile,
        email: it.createdBy.email,
      };
      //normal order
      order.totalItemsQty = it.cart.cartItems.length;
      order.cart = {
        id: it.cart.id,
        amount: it.cart.amount,
        specialInstruction: it.cart.specialInstruction
          ? it.cart.specialInstruction
          : null,
        cartItems: [],
      };
      it.cart.cartItems?.forEach((menu: any) => {
        order.cart.cartItems.push({
          id: menu.id,
          quantity: menu.quantity,
          amount: menu.amount,
          devotees:
            menu.devotees && menu.devotees.length
              ? menu.devotees.map((it) => {
                  return {
                    id: it.id,
                    name: it.name,
                    rasi: it.rasi,
                    star: it.star,
                  };
                })
              : null,
          service: {
            id: menu.serviceCalendar.service.id,
            title: menu.serviceCalendar.service.title,
            description: menu.serviceCalendar.service.description || null,
            price: menu.serviceCalendar.service.price,
            currency: menu.serviceCalendar.service.currency,
            imageUrl: menu.serviceCalendar.service.imageUrl
              ? `${process.env.BASE_URL}/${menu.serviceCalendar.service.imageUrl.url}`
              : null,
            serviceCalendars: [
              {
                id: menu.serviceCalendar.id,
                date: menu.serviceCalendar.date,
              },
            ],
          },
        });
      });
      updatedOrders.push(order);
    }
    const generalOrders = [];
    updatedOrders.forEach((it) => {
      if (
        it.cart.cartItems[0].service &&
        it.cart.cartItems[0].service.serviceCalendars &&
        it.cart.cartItems[0].service.serviceCalendars[0].date
      ) {
        generalOrders.push(it);
      }
    });
    return generalOrders;
  }

  async userEvents(
    user: User,
    status: string,
    startDate?: string,
    endDate?: string,
  ) {
    const whereCondition: Prisma.OrderWhereInput = {
      isActive: true,
      cart: { userId: user.id },
    };
    if (status === WEBHOOK_SUCCESS) {
      whereCondition.orderStatus = WEBHOOK_SUCCESS;
    } else if (status === WEBHOOK_FAILURE) {
      whereCondition.orderStatus = { in: [WEBHOOK_FAILURE, PENDING] };
    }
    const cartItemsCondition: Prisma.Cart$cartItemsArgs = {
      include: {
        devotees: {
          select: { id: true, name: true, rasi: true, star: true },
        },
        serviceCalendar: {
          include: { service: { include: { imageUrl: true } } },
        },
      },
    };
    if (startDate || endDate) {
      const userOrders = await this.prisma.order.findMany({
        where: whereCondition,
        orderBy: { createdAt: 'desc' },
        include: {
          cart: {
            include: {
              cartItems: {
                include: {
                  serviceCalendar: true,
                },
              },
            },
          },
        },
      });
      const milliseconds = [];
      for (const order of userOrders) {
        order.cart.cartItems.forEach((item) => {
          const date = new Date(item.serviceCalendar.date);
          milliseconds.push(date.getTime());
        });
      }
      const maxMillisecond = Math.max(...milliseconds);
      const maxDate = new Date(maxMillisecond).toISOString();
      let startTime;
      let endTime;
      if (endDate) {
        endTime = new Date(endDate);
        endTime.setHours(23, 59, 59, 999);
        whereCondition.cart = {
          cartItems: {
            some: {
              serviceCalendar: { date: { lte: endTime } },
            },
          },
        };
      } else {
        if (startDate) {
          startTime = new Date(startDate);
          startTime.setHours(0, 0, 0, 0);
          endTime = new Date(maxDate);
          endTime.setHours(23, 59, 59, 999);
        } else if (startDate && endDate) {
          startTime = new Date(startDate);
          startTime.setHours(0, 0, 0, 0);
          endTime = new Date(endDate);
          endTime.setHours(23, 59, 59, 999);
        }
        whereCondition.cart = {
          cartItems: {
            some: {
              serviceCalendar: { date: { gte: startTime, lte: endTime } },
            },
          },
        };
      }
      cartItemsCondition.where = whereCondition.cart.cartItems.some;
    }
    const orders = await this.prisma.order.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { include: { role: true } },
        createdFor: true,
        cart: {
          include: {
            cartItems: cartItemsCondition,
          },
        },
        service: { include: { ServiceType: true } },
        payment: true,
        address: true,
      },
    });
    const updatedOrders = [];
    for (const it of orders) {
      let familyMembers = null;
      if (
        (it.createdBy && it.createdBy.role.name === ROLE_USER) ||
        (it.createdBy &&
          it.createdBy.role.name === ROLE_ADMIN &&
          it.createdForId)
      ) {
        familyMembers = await this.prisma.familyMember.findMany({
          where: {
            userId:
              it.createdBy.role.name === ROLE_USER
                ? it.createdBy.id
                : it.createdForId,
          },
          select: { name: true, rasi: true, star: true },
        });
      }
      if (!it.cart) {
        return;
      }
      const order: any = {
        id: it.id,
        amount: it?.amount || null,
        orderId: it.orderId || null,
        orderNo: it.orderNo,
        orderStatus: it.orderStatus,
        paymentId: it.paymentId,
        mode: it.payment?.mode || null,
        additionalInfo: it?.additionalInfo,
        paymentMethod: it.payment?.paymentMethod || null,
        inPersonVisit: it.inPersonVisit,
        createdAt: it.createdAt,
        address: it?.address || null,
        familyMembers: familyMembers,
      };
      order.createdBy = it.createdFor
        ? {
            id: it.createdFor.id,
            name: it.createdFor.name,
            gothram: it.createdFor.gothram,
            countryCode: it.createdFor.countryCode,
            mobile: it.createdFor.mobile,
            email: it.createdFor.email,
          }
        : {
            id: it.createdBy.id,
            name: it.createdBy.name,
            gothram: it.createdBy.gothram,
            countryCode: it.createdBy.countryCode,
            mobile: it.createdBy.mobile,
            email: it.createdBy.email,
          };
      //displaying createdBy value in createdFor
      order.createdFor = {
        id: it.createdBy.id,
        name: it.createdBy.name,
        gothram: it.createdBy.gothram,
        countryCode: it.createdBy.countryCode,
        mobile: it.createdBy.mobile,
        email: it.createdBy.email,
      };
      //normal order
      order.totalItemsQty = it.cart.cartItems.length;
      order.cart = {
        id: it.cart.id,
        amount: it.cart.amount,
        specialInstruction: it.cart.specialInstruction
          ? it.cart.specialInstruction
          : null,
        cartItems: [],
      };
      it.cart.cartItems?.forEach((menu: any) => {
        order.cart.cartItems.push({
          id: menu.id,
          quantity: menu.quantity,
          amount: menu.amount,
          devotees:
            menu.devotees && menu.devotees.length
              ? menu.devotees.map((it) => {
                  return {
                    id: it.id,
                    name: it.name,
                    rasi: it.rasi,
                    star: it.star,
                  };
                })
              : null,
          service: {
            id: menu.serviceCalendar.service.id,
            title: menu.serviceCalendar.service.title,
            description: menu.serviceCalendar.service.description || null,
            price: menu.serviceCalendar.service.price,
            currency: menu.serviceCalendar.service.currency,
            imageUrl: menu.serviceCalendar.service.imageUrl
              ? `${process.env.BASE_URL}/${menu.serviceCalendar.service.imageUrl.url}`
              : null,
            serviceCalendars: [
              {
                id: menu.serviceCalendar.id,
                date: menu.serviceCalendar.date,
              },
            ],
          },
        });
      });
      updatedOrders.push(order);
    }
    const generalOrders = [];
    updatedOrders.forEach((it) => {
      if (
        it.cart.cartItems[0].service &&
        it.cart.cartItems[0].service.serviceCalendars &&
        it.cart.cartItems[0].service.serviceCalendars[0].date
      ) {
        generalOrders.push(it);
      }
    });
    return generalOrders;
  }

  async vastramOrders(startDate: string, endDate: string, type: string) {
    const whereCondition: Prisma.OrderWhereInput = {
      isActive: true,
      service: { ServiceType: { type: { in: ['Vastram'] } } },
    };
    whereCondition.orderStatus = WEBHOOK_SUCCESS;
    if (startDate && endDate) {
      let endTime;
      let startTime;
      startTime = new Date(startDate);
      startTime.setHours(0, 0, 0, 0);
      endTime = new Date(endDate);
      endTime.setHours(23, 59, 59, 999);
      if (type === CREATED_VASTRAMS) {
        whereCondition.createdAt = {
          gte: startTime,
          lte: endTime,
        };
      } else {
        whereCondition.additionalInfo = {
          path: ['date'],
          gte: startTime,
          lte: endTime,
        };
      }
    }
    const orders = await this.prisma.order.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { include: { role: true } },
        createdFor: true,
        service: { include: { ServiceType: true, imageUrl: true } },
        payment: true,
        address: true,
      },
    });
    const updatedOrders = [];
    for (const it of orders) {
      let familyMembers = null;
      if (
        (it.createdBy && it.createdBy.role.name === ROLE_USER) ||
        (it.createdBy &&
          it.createdBy.role.name === ROLE_ADMIN &&
          it.createdForId)
      ) {
        familyMembers = await this.prisma.familyMember.findMany({
          where: {
            userId:
              it.createdBy.role.name === ROLE_USER
                ? it.createdBy.id
                : it.createdForId,
          },
          select: { name: true, rasi: true, star: true },
        });
      }
      const order: any = {
        id: it.id,
        amount: it.amount || null,
        orderId: it.orderId || null,
        orderNo: it.orderNo,
        orderStatus: it.orderStatus,
        paymentId: it.paymentId,
        mode: it.payment?.mode || null,
        additionalInfo: it.additionalInfo || null,
        paymentMethod: it.payment?.paymentMethod || null,
        inPersonVisit: it.inPersonVisit,
        createdAt: it.createdAt,
        address: it?.address || null,
        familyMembers: familyMembers,
      };
      order.createdBy = it.createdFor
        ? {
            id: it.createdFor.id,
            name: it.createdFor.name,
            gothram: it.createdFor.gothram,
            countryCode: it.createdFor.countryCode,
            mobile: it.createdFor.mobile,
            email: it.createdFor.email,
          }
        : {
            id: it.createdBy.id,
            name: it.createdBy.name,
            gothram: it.createdBy.gothram,
            countryCode: it.createdBy.countryCode,
            mobile: it.createdBy.mobile,
            email: it.createdBy.email,
          };
      //displaying createdBy value in createdFor
      order.createdFor = {
        id: it.createdBy.id,
        name: it.createdBy.name,
        gothram: it.createdBy.gothram,
        countryCode: it.createdBy.countryCode,
        mobile: it.createdBy.mobile,
        email: it.createdBy.email,
      };
      order.totalItemsQty = 1;
      order.cart = {
        specialInstruction: it.specialInstruction
          ? it.specialInstruction
          : null,
        cartItems: [],
      };
      order.cart.cartItems.push({
        devotees: null,
        service: {
          id: it.service.id,
          title: it.service.title,
          description: it.service.description || null,
          imageUrl: it.service.imageUrl
            ? `${process.env.BASE_URL}/${it.service.imageUrl.url}`
            : null,
        },
      });
      updatedOrders.push(order);
    }
    return updatedOrders;
  }

  async orderStatus(orderId: string) {
    let order;
    for (let i = 0; i < 20; i++) {
      order = await this.prisma.order.findFirst({
        where: { orderId },
        include: { payment: true },
      });
      if (
        order.orderStatus === CC_AVENUE.STATUS.SUCCESS ||
        order.orderStatus === CC_AVENUE.STATUS.FAILURE
      ) {
        break;
      } else {
        await waitFunction(3000);
      }
    }
    console.log('order>>>', order);
    const response: _OrderResponse = {
      amount: order.amount,
      orderId: order.orderId,
      paymentId: order.payment?.paymentId || null,
      success: order.orderStatus === CC_AVENUE.STATUS.SUCCESS ? true : false,
    };
    return response;
  }
}
