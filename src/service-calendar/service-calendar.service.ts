import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AMAVASYA } from 'src/const';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserAndRole } from 'src/user/user.model';
import { CreateServiceCalendarDto } from './dto/create-service-calendar.dto';
import { UpdateServiceCalendarDto } from './dto/update-service-calendar.dto';

@Injectable()
export class ServiceCalendarService {
  constructor(private readonly prisma: PrismaService) {}
  async createServiceCalendar(
    serviceId: string,
    dates: CreateServiceCalendarDto,
  ) {
    let serviceCalender;
    /*const amavasya2023 = [
      "2023-01-21",
      "2023-02-20",
      "2023-03-21",
      "2023-04-19",
      "2023-05-17",
      "2023-06-17",
      "2023-07-17",
      "2023-08-16",
      "2023-09-14",
      "2023-10-14",
      "2023-11-13",
      "2023-12-12",
    ];*/
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
    });
    const occurence = (service.occurence as Prisma.JsonArray).map((it) => it);
    if (!service) {
      throw new NotFoundException('service not found');
    }
    for (const date of dates.date) {
      const dateISO = new Date(date);
      const calendar = await this.prisma.serviceCalendar.findFirst({
        where: { AND: [{ serviceId: service.id }, { date: dateISO }] },
      });
      if (calendar) {
        throw new BadRequestException(
          `Service Calender already exists for amavasya in this date ${date}`,
        );
      }
      serviceCalender = await this.prisma.serviceCalendar.create({
        data: { date: dateISO, serviceId: service.id },
      });
      console.log(serviceCalender);
    }
    return;
  }

  async findAll(
    templeId: string,
    user: UserAndRole,
    serviceTypeId: string,
    date: string,
    startDate: string,
    endDate: string,
  ) {
    const currentDate = new Date().toISOString().slice(0, 10);
    const newDate = new Date(`${currentDate} 00:00:00.000`);
    const whereCondition: Prisma.ServiceCalendarWhereInput = {
      isActive: true,
      date: { gte: newDate },
      service: {
        ServiceType: { isActive: true },
        temple: { templeId: templeId },
        prebookCutOff: { equals: 0 },
        isActive: true,
      },
    };

    if (date) {
      const dateString = date.slice(0, 10);
      const startTime = new Date(`${dateString} 00:00:00.000`);
      const endTime = new Date(`${dateString} 23:59:59.999`);
      whereCondition.date = {
        gte: startTime,
        lt: endTime,
      };
    }
    if (startDate) {
      const startDateString = startDate.slice(0, 10);
      const endDateString = endDate.slice(0, 10);
      const startTime = new Date(`${startDateString} 00:00:00.000`);
      const endTime = new Date(`${endDateString} 23:59:59.999`);
      whereCondition.date = {
        gte: newDate,
        gt: startTime,
        lt: endTime,
      };
    }

    if (serviceTypeId) {
      whereCondition.service = {
        serviceTypeId: serviceTypeId,
      };
    }
    const serviceCalendars = await this.prisma.serviceCalendar.findMany({
      where: whereCondition,
      include: {
        service: {
          include: {
            imageUrl: true,
            temple: {
              where: {
                templeId: templeId,
                isActive: true,
                users: { some: { id: user.id } },
              },
            },
            ServiceType: { where: { isActive: true } },
          },
        },
      },
    });
    const allServiceCalendars = [];
    serviceCalendars.forEach((it) => {
      allServiceCalendars.push({
        id: it.service.id,
        title: it.service.title,
        description: it.service.description,
        note: it.service.note,
        price: it.service.price,
        currency: it.service.currency,
        imageUrl: it.service.imageUrl
          ? `${process.env.BASE_URL}/${it.service.imageUrl.url}`
          : null,
        serviceCalendars: [{ id: it.id, date: it.date }],
      });
    });
    return allServiceCalendars;
  }

  async findOne(id: string) {
    const serviceCalendar = await this.prisma.serviceCalendar.findUnique({
      where: { id, isActive: true },
    });
    if (!serviceCalendar) {
      throw new NotFoundException(`serviceCalendar not found`);
    }
    return serviceCalendar;
  }
  async update(input: UpdateServiceCalendarDto) {
    return await this.prisma.serviceCalendar.updateMany({
      where: { id: { in: input.calendarIds } },
      data: { isActive: input.isAvailable },
    });
  }

  /*  remove(id: number) {
    return `This action removes a #${id} serviceCalendar`;
  }*/
}
