import { BadRequestException, Injectable } from '@nestjs/common';
import { TokenUser, User } from 'src/user/user.model';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  NEW_NOTIFICATION,
  NOTIFICATIONS,
  NOTIFICATION_ADMIN_SKIP,
  NOTIFICATION_NON_ADMIN_SKIP,
  ROLE_ADMIN,
  ROLE_GUEST,
  ROLE_USER,
} from 'src/const';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UserService } from 'src/user/user.service';
import { FirebaseService } from 'src/firebase/fireBase.service';
import { notification } from 'src/utils/helperFunction';

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private userService: UserService,
    private firebase: FirebaseService,
  ) // private notificationService: NotificationService,
  { }

  async create(input: {
    title: string;
    description: string;
    targetId: string;
    targetModule: string;
    users: TokenUser[];
    role: string;
  }) {
    const data = input.users.map((it) => {
      return {
        title: input.title,
        description: input.description,
        targetId: input.targetId,
        targetModule: input.targetModule,
        role: it.role,
        userId: it.userId,
      };
    });

    await this.prisma.notification.createMany({ data });
    let Ids = [];
    for (let i = 0; i < data.length; i++) {
      const whereCondition: Prisma.NotificationWhereInput = {
        role: data[i].role,
        userId: data[i].userId,
      };
      const args: Prisma.NotificationFindManyArgs = {
        select: { id: true },
        orderBy: [{ createdAt: 'desc' }],
      };
      if (data[i].role === ROLE_ADMIN) {
        args.skip = NOTIFICATION_ADMIN_SKIP;
      } else {
        args.skip = NOTIFICATION_NON_ADMIN_SKIP;
      }
      args.where = whereCondition;
      const notificationIds = await this.prisma.notification.findMany(args);
      notificationIds.forEach((item) => Ids.push(item.id));
    }
    const delted = await this.prisma.notification.deleteMany({
      where: { id: { in: Ids } },
    });
    return;
  }

  async createNotification(input: CreateNotificationDto) {
    if (input.role) {
      if (input.role === ROLE_GUEST) {
        const guestUser = await this.userService.getUserTokens([
          { role: ROLE_GUEST },
        ]);
        if (guestUser.length) {
          notification(
            this.firebase,
            guestUser,
            input.title,
            input.description,
            NOTIFICATIONS,
            NEW_NOTIFICATION,
            { id: '' },
            this,
            ROLE_GUEST,
          );
        }
      } else {
        const user = await this.userService.getUserTokens([
          { role: ROLE_USER },
        ]);
        if (user.length) {
          notification(
            this.firebase,
            user,
            input.title,
            input.description,
            NOTIFICATIONS,
            NEW_NOTIFICATION,
            { id: '' },
            this,
            ROLE_USER,
          );
        }
      }
    } else {
      const users = await this.userService.getUserTokens([{ role: ROLE_USER }]);
      if (users.length) {
        notification(
          this.firebase,
          users,
          input.title,
          input.description,
          NOTIFICATIONS,
          NEW_NOTIFICATION,
          { id: '' },
          this,
          ROLE_USER,
        );
      }
      const guestUser = await this.userService.getUserTokens([
        { role: ROLE_GUEST },
      ]);
      if (guestUser.length) {
        notification(
          this.firebase,
          guestUser,
          input.title,
          input.description,
          NOTIFICATIONS,
          NEW_NOTIFICATION,
          { id: '' },
          this,
          ROLE_GUEST,
        );
      }
    }
    return 'notification created';
  }

  async findAll(user: User) {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - 30)
    return await this.prisma.notification.findMany({
      where: { userId: user.id, updatedAt: { gte: currentDate } },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    return await this.prisma.notification.findFirst({
      where: { id },
    });
  }

  async update(user: User, input: UpdateNotificationDto) {
    let updatedNotification;
    const data: Prisma.NotificationUpdateInput = {};
    if (input.id) {
      const notification = await this.prisma.notification.findFirst({
        where: { id: input.id, userId: user.id },
      });
      data.isRead = true;
      if (notification.isRead === true) {
        throw new BadRequestException('already read');
      }
      updatedNotification = await this.prisma.notification.update({
        where: { id: input.id },
        data,
      });
    } else {
      const unReadnotifications = await this.prisma.notification.findMany({
        where: { userId: user.id, NOT: [{ isRead: true }] },
      });
      if (unReadnotifications.length) {
        data.isRead = true;
        await this.prisma.notification.updateMany({
          where: { userId: user.id, NOT: [{ isRead: true }] },
          data,
        });
        updatedNotification = await this.findAll(user);
      } else {
        throw new BadRequestException('already read');
      }
    }
    return updatedNotification;
  }
}
