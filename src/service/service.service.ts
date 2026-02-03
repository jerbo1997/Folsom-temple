import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserAndRole } from 'src/user/user.model';
import { CreateServiceDto } from './dto/create-service.dto';
import {
  calendars,
  fetchFiles,
  serviceInputValidation,
  uploadFile,
} from 'src/utils/helperFunction';
import {
  CUSTOM_DATES_PICKER,
  DAILY,
  DATES_RANGE,
  DONATION_SERVICE,
  FIXED,
  VARIABLE,
} from 'src/const';
import { CreateDonationDto } from './dto/create-donation.dto';
import { UpdateDonationDto } from './dto/update-donation.dto';

@Injectable()
export class ServiceService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createServiceDto: CreateServiceDto, imageUrl?: string) {
    if (createServiceDto.occurenceType) {
      await serviceInputValidation(
        createServiceDto.occurenceType,
        createServiceDto.occurence,
        createServiceDto.dates,
      );
    }
    const data: Prisma.ServiceCreateInput = {
      title: createServiceDto.title,
      price: createServiceDto.price,
      currency: createServiceDto.currency,
      description: createServiceDto.description,
      note: createServiceDto.note,
      time: createServiceDto.time,
      occurence: createServiceDto.occurence as Prisma.JsonArray,
      occurenceType: createServiceDto.occurenceType,
      timing: createServiceDto.timing,
      season: createServiceDto.season,
      prebookCutOff: createServiceDto.prebookCutOff,
      ServiceType: { connect: { id: createServiceDto.serviceTypeId } },
      temple: { connect: { templeId: createServiceDto.templeId } },
    };
    if (!imageUrl) {
      data.imageUrl = {
        create: { mime: 'png', url: 'serviceType/Abhishekams.png' },
      };
    }
    if (
      data.occurence === null &&
      createServiceDto.occurenceType.includes(DAILY)
    ) {
      data.occurence = [DAILY];
    }
    if (createServiceDto.dates && createServiceDto.dates.length) {
      data.dates = createServiceDto.dates;
    }
    if (
      createServiceDto.occurenceType.includes(CUSTOM_DATES_PICKER) ||
      createServiceDto.occurenceType.includes(DATES_RANGE)
    ) {
      const newCalendars = [];
      createServiceDto.dates.forEach((it) => {
        newCalendars.push({ date: it });
      });
      data.serviceCalendar = { createMany: { data: newCalendars } };
    }
    const service = await this.prisma.service.create({ data });
    if (
      createServiceDto.occurence ||
      createServiceDto.occurenceType.includes(DAILY)
    ) {
      const cron = await this.prisma.config.findFirst();
      const date = new Date().getTime();
      const endDate = new Date(cron.serviceNextCron).getTime();
      const totalDays = (endDate - date) / (1000 * 60 * 60 * 24);
      const dates = [];
      for (let i = 0; i < totalDays; i++) {
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + i);
        dates.push(nextDate);
      }
      await calendars(this.prisma, dates, [service.id]);
    }
    return await this.prisma.service.findUnique({
      where: { id: service.id },
      include: { serviceCalendar: true },
    });
  }

  async findAll(user: UserAndRole) {
    const whereCondition: Prisma.ServiceWhereInput = {
      parentServiceId: null,
      isActive: true,
    };
    return await this.prisma.service.findMany({
      where: whereCondition,
      include: { subServices: true },
    });
  }

  async findOne(id: string) {
    const currentTime = new Date();
    const newDate = new Date(currentTime);
    newDate.setHours(0, 0, 0, 0);
    const service = await this.prisma.service.findUnique({
      where: {
        id,
        isActive: true,
      },
      include: {
        imageUrl: true,
        serviceCalendar: {
          where: { date: { gte: newDate } },
          orderBy: { date: 'asc' },
        },
      },
    });
    if (!service) {
      throw new NotFoundException(`service not foound`);
    }
    service.attachments && service.attachments.length
      ? (service.attachments = fetchFiles(service.attachments))
      : [];
    //prebook cutoff logic
    const resultantDate = new Date(currentTime);
    resultantDate.setDate(currentTime.getDate() + service.prebookCutOff);
    const newCalendars =
      service.serviceCalendar && service.serviceCalendar.length
        ? service.serviceCalendar.filter(
            (it) => resultantDate.getTime() < new Date(it.date).getTime(),
          )
        : [];
    //restructure
    const updatedService: any = {};
    updatedService.id = service.id;
    updatedService.title = service.title;
    updatedService.price = service.price;
    updatedService.currency = service.currency;
    updatedService.occurence = service.occurence;
    updatedService.occurenceType = service.occurenceType;
    updatedService.dates = service.dates;
    updatedService.prebookCutOff = service.prebookCutOff;
    updatedService.note = service.note ? service.note : null;
    updatedService.config =
      service.config !== null && Object.keys(service.config).length
        ? service.config
        : null;
    updatedService.attachments = service.attachments || null;
    updatedService.description = service.description
      ? service.description
      : null;
    (updatedService.imageUrl = service.imageUrl
      ? `${process.env.BASE_URL}/${service.imageUrl.url}`
      : null),
      (updatedService.serviceCalendars =
        newCalendars && newCalendars.length
          ? newCalendars.map((it) => ({
              id: it.id,
              date: it.date,
            }))
          : []);
    return updatedService;
  }

  async remove(
    id: string,
    deactiveCalender: string[],
    deletedCalender: string[],
  ) {
    const service = await this.prisma.service.update({
      where: { id },
      data: { isActive: false },
    });
    await this.prisma.serviceCalendar.updateMany({
      where: { id: { in: deactiveCalender } },
      data: { isActive: false },
    });
    await this.prisma.serviceCalendar.deleteMany({
      where: { id: { in: deletedCalender } },
    });
    return service;
  }

  async enableOrDisableService(id: string, isActive: boolean) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: {
        serviceCalendar: {
          include: {
            cartItems: { include: { cart: { include: { order: true } } } },
          },
        },
      },
    });
    if (!service) {
      throw new NotFoundException('Service not found');
    }
    if (service.isActive === isActive) {
      throw new BadRequestException('Invalid input provided');
    }
    if (
      service.occurenceType?.length &&
      (service.occurenceType.includes(CUSTOM_DATES_PICKER) ||
        service.occurenceType.includes(DATES_RANGE))
    ) {
      throw new BadRequestException(
        `can't enable the service when the service occurenceType is ${service.occurenceType[0]}`,
      );
    }
    const data: Prisma.ServiceUpdateInput = {};
    data.isActive = isActive;
    if (isActive) {
      if (service.occurence || service.occurenceType.includes(DAILY)) {
        const cron = await this.prisma.config.findFirst();
        const date = new Date().getTime();
        const endDate = new Date(cron.serviceNextCron).getTime();
        const totalDays = (endDate - date) / (1000 * 60 * 60 * 24);
        const dates = [];
        for (let i = 0; i < totalDays; i++) {
          const nextDate = new Date();
          nextDate.setDate(nextDate.getDate() + i);
          dates.push(nextDate);
        }
        await calendars(this.prisma, dates, [service.id]);
      }
    } else {
      const deactiveCalender = [];
      const deletedCalendar = [];
      if (service.serviceCalendar && service.serviceCalendar.length) {
        const serviceCalendarIds = [];
        for (const calendar of service.serviceCalendar) {
          serviceCalendarIds.push(calendar.id);
        }
        const carts = await this.prisma.cart.findMany({
          where: {
            cartItems: {
              some: { serviceCalendarId: { in: serviceCalendarIds } },
            },
            checkout: false,
          },
          select: { id: true },
        });
        const cartIds = [];
        if (carts.length) {
          carts.forEach((it) => {
            cartIds.push(it.id);
          });
        }
        if (cartIds.length) {
          await this.prisma.cart.deleteMany({
            where: { id: { in: cartIds } },
          });
        }
        service.serviceCalendar.forEach((it) => {
          if (it.cartItems && it.cartItems.length) {
            it.cartItems.forEach((item) => {
              if (item.cart.order) {
                deactiveCalender.push(it.id);
              }
            });
          } else {
            deletedCalendar.push(it.id);
          }
        });
        if (deactiveCalender.length) {
          await this.prisma.serviceCalendar.updateMany({
            where: { id: { in: deactiveCalender } },
            data: { isActive },
          });
        }
        if (deletedCalendar.length) {
          await this.prisma.serviceCalendar.deleteMany({
            where: { id: { in: deletedCalendar } },
          });
        }
      }
    }
    return await this.prisma.service.update({ where: { id }, data });
  }

  async createDonation(
    createDonation: CreateDonationDto,
    attachments: Express.Multer.File[],
  ) {
    const data: Prisma.ServiceCreateInput = {
      title: createDonation.title,
      currency: createDonation.currency,
      description: createDonation.description,
      note: createDonation.note,
      ServiceType: { connect: { id: createDonation.serviceTypeId } },
      temple: { connect: { templeId: createDonation.templeId } },
    };
    data.config = {
      maxAmount: createDonation.maxAmount,
      minAmount: createDonation.minAmount,
      isEditable: createDonation.type === FIXED ? false : true,
    };
    if (!attachments || !attachments.length) {
      data.imageUrl = {
        create: { mime: 'png', url: 'serviceType/Abhishekams.png' },
      };
    }
    if (attachments && attachments.length) {
      const url = await uploadFile(attachments, DONATION_SERVICE);
      data.attachments = url;
    }
    const donation = await this.prisma.service.create({ data });
    if (donation.attachments && donation.attachments.length) {
      donation.attachments = fetchFiles(donation.attachments);
    }
    return donation;
  }

  async removeDonation(id: string) {
    return await this.prisma.service.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async updateDonation(
    id: string,
    updateDonation: UpdateDonationDto,
    donation: any,
  ) {
    const config = donation.config as Prisma.JsonObject;
    if (
      (config.isEditable === true && updateDonation.type === FIXED) ||
      (config.isEditable === false && updateDonation.type === VARIABLE)
    ) {
      const createData: Prisma.ServiceCreateInput = {
        title: updateDonation.title,
        currency: updateDonation.currency,
        description: updateDonation.description,
        note: updateDonation.note,
        temple: { connect: { templeId: donation.temple.templeId } },
        ServiceType: { connect: { id: donation.ServiceType.id } },
      };
      createData.config = {
        maxAmount: updateDonation.maxAmount,
        minAmount: updateDonation.minAmount,
        isEditable: updateDonation.type === FIXED ? false : true,
      };
      const createdDonation = await this.prisma.service.create({
        data: createData,
      });
      if (createdDonation) {
        await this.prisma.service.update({
          where: { id },
          data: { isActive: false },
        });
      }
      return createdDonation;
    } else {
      const data: Prisma.ServiceUpdateInput = {
        title: updateDonation.title,
        currency: updateDonation.currency,
        description: updateDonation.description,
        note: updateDonation.note,
      };
      data.config = {
        maxAmount: updateDonation.maxAmount
          ? updateDonation.maxAmount
          : config.maxAmount,
        minAmount: updateDonation.minAmount
          ? updateDonation.minAmount
          : config.minAmount,
        isEditable: updateDonation.type === FIXED ? false : true,
      };
      return await this.prisma.service.update({ where: { id }, data });
    }
  }
}
