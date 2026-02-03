import { Injectable } from '@nestjs/common';
import { EVENT, NEW_EVENT, ROLE_GUEST, ROLE_USER } from 'src/const';
import { FirebaseService } from 'src/firebase/fireBase.service';
import { NotificationService } from 'src/notification/notification.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import {
  calendars,
  notification,
  notificationMessages,
} from 'src/utils/helperFunction';

@Injectable()
export class CronConfigService {
  constructor(
    private readonly prisma: PrismaService,
    private userService: UserService,
    private firebase: FirebaseService,
    private notificationService: NotificationService,
  ) {}
  async createCalendar() {
    const currentDateInMills = new Date().getTime();
    const currentDate = new Date().toDateString();
    console.log(currentDate, 'currentDate >>>>>>>', currentDate);
    const dates = [];
    const cron = await this.prisma.config.findFirst();
    const services = await this.prisma.service.findMany();
    const serviceIds = services.map((it) => it.id);
    // currentDate, dates, config intial fetch, config post update
    // datestring comparison
    if (cron && cron.serviceNextCron.toDateString() === currentDate) {
      for (let i = 0; i < 90; i++) {
        const date = new Date();
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + i);
        dates.push(nextDate);
      }
      console.log('90 days dates-array >>>>>', dates);
      await calendars(this.prisma, dates, serviceIds);
      //serviceNextCron - 90+1 date
      const nextCronDate = dates[dates.length - 1];
      await this.prisma.config.update({
        where: { id: cron.id },
        data: {
          serviceNextCron: new Date(
            nextCronDate.setDate(nextCronDate.getDate() + 1),
          ),
        },
      });
      const serviceCalendar = await this.prisma.serviceCalendar.findMany();
      console.log(
        'ServiceCalendar loaded successfully >>>>>>>',
        serviceCalendar.length,
      );
    } else if (cron && cron.serviceNextCron.toDateString() !== currentDate) {
      const cronDateInMills = cron.serviceNextCron.getTime();
      const timeDifference =
        (cronDateInMills - currentDateInMills) / (1000 * 60 * 60 * 24);
      const datesDifference = Math.round(timeDifference);
      if (datesDifference === 45) {
        for (let i = 0; i < 45; i++) {
          const nextDate = new Date(cron.serviceNextCron);
          nextDate.setDate(nextDate.getDate() + i);
          dates.push(nextDate);
        }
        console.log('45 days dates-array >>>>>', dates);
        await calendars(this.prisma, dates, serviceIds);
        const nextCronDate = dates[dates.length - 1];
        await this.prisma.config.update({
          where: { id: cron.id },
          data: {
            serviceNextCron: new Date(
              nextCronDate.setDate(nextCronDate.getDate() + 1),
            ),
            serviceCronLoadDays: 45,
          },
        });
        const serviceCalendar = await this.prisma.serviceCalendar.findMany();
        console.log(
          'ServiceCalendar updated successfully >>>>>>>',
          serviceCalendar.length,
        );
      }
    }
  }
  async disableService() {
    const date = new Date();
    await this.prisma.service.updateMany({
      where: { endDate: { lt: date } },
      data: {
        isActive: false,
      },
    });
  }
  async notificationAtNoonForEvent() {
    const currentDate = new Date();
    const nextDateStart = new Date(currentDate);
    nextDateStart.setDate(nextDateStart.getDate() + 1);
    const nextDateEnd = new Date(currentDate);
    nextDateEnd.setDate(nextDateEnd.getDate() + 2);
    nextDateEnd.setMilliseconds(nextDateEnd.getMilliseconds() - 1);
    const startTime = nextDateStart.toISOString();
    const endTime = nextDateEnd.toISOString();
    //random logic
    const serviceCount = await this.prisma.serviceCalendar.count();
    const random = Math.floor(Math.random() * serviceCount);
    const serviceCalendar = await this.prisma.serviceCalendar.findFirst({
      where: { date: { gte: startTime, lte: endTime } },
      skip: random,
      include: { service: true },
    });
    if (serviceCalendar && serviceCalendar.service) {
      const users = await this.userService.getUserTokens([{ role: ROLE_USER }]);
      const userNotification = notificationMessages(EVENT, NEW_EVENT, {
        eventName: serviceCalendar.service.title,
      });
      if (users.length) {
        notification(
          this.firebase,
          users,
          userNotification.title,
          userNotification.body,
          EVENT,
          NEW_EVENT,
          serviceCalendar,
          this.notificationService,
          ROLE_USER,
        );
      }
      const guest = await this.userService.getUserTokens([
        { role: ROLE_GUEST },
      ]);
      const guestUserNotification = notificationMessages(EVENT, NEW_EVENT, {
        eventName: serviceCalendar.service.title,
      });
      if (guest.length) {
        notification(
          this.firebase,
          guest,
          guestUserNotification.title,
          guestUserNotification.body,
          EVENT,
          NEW_EVENT,
          serviceCalendar,
          this.notificationService,
          ROLE_GUEST,
        );
      }
    }
  }
  async notificationAtEveningForEvent() {
    const currentDate = new Date();
    const nextDateStart = new Date(currentDate);
    nextDateStart.setDate(nextDateStart.getDate() + 1);
    const nextDateEnd = new Date(currentDate);
    nextDateEnd.setDate(nextDateEnd.getDate() + 2);
    nextDateEnd.setMilliseconds(nextDateEnd.getMilliseconds() - 1);
    const startTime = nextDateStart.toISOString();
    const endTime = nextDateEnd.toISOString();
    //random logic
    const serviceCount = await this.prisma.serviceCalendar.count();
    const random = Math.floor(Math.random() * serviceCount);
    const serviceCalendar = await this.prisma.serviceCalendar.findFirst({
      where: { date: { gte: startTime, lte: endTime } },
      skip: random,
      include: { service: true },
    });
    if (serviceCalendar && serviceCalendar.service) {
      const users = await this.userService.getUserTokens([{ role: ROLE_USER }]);
      const userNotification = notificationMessages(EVENT, NEW_EVENT, {
        eventName: serviceCalendar.service.title,
      });
      if (users.length) {
        notification(
          this.firebase,
          users,
          userNotification.title,
          userNotification.body,
          EVENT,
          NEW_EVENT,
          serviceCalendar,
          this.notificationService,
          ROLE_USER,
        );
      }
      const guest = await this.userService.getUserTokens([
        { role: ROLE_GUEST },
      ]);
      const guestUserNotification = notificationMessages(EVENT, NEW_EVENT, {
        eventName: serviceCalendar.service.title,
      });
      if (guest.length) {
        notification(
          this.firebase,
          guest,
          guestUserNotification.title,
          guestUserNotification.body,
          EVENT,
          NEW_EVENT,
          serviceCalendar,
          this.notificationService,
          ROLE_GUEST,
        );
      }
    }
  }
}
