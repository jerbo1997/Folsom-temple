import { Injectable, NotFoundException } from '@nestjs/common';
import { DONATION, GENERIC, REQURING, VASTRAM } from 'src/const';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserAndRole } from 'src/user/user.model';
import { fetchFiles } from 'src/utils/helperFunction';

@Injectable()
export class ServiceTypeService {
  constructor(private readonly prisma: PrismaService) {}
  /*create(createServiceTypeDto: CreateServiceTypeDto) {
    return 'This action adds a new serviceType';
  }*/

  async findOne() {
    const serviceType = await this.prisma.serviceType.findFirst({
      where: {
        type: DONATION,
        services: {
          some: {
            config: { path: ['isEditable'], not: null },
            isActive: true,
          },
        },
        isActive: true,
      },
      include: {
        services: { where: { isActive: true }, include: { imageUrl: true } },
        imageUrl: true,
      },
    });
    if (!serviceType) {
      throw new NotFoundException(`serviceType not foound`);
    }
    const type = {
      id: serviceType.id,
      type: serviceType.type,
      description: serviceType.description,
      imageUrl: serviceType.imageUrl
        ? `${process.env.BASE_URL}/${serviceType.imageUrl.url}`
        : null,
      services: [],
    };
    serviceType.services?.forEach((service) => {
      const data = {
        id: service.id,
        title: service.title,
        description: service.description,
        note: service.note,
        config: service.config,
        currency: service.currency,
        attachments: [],
        imageUrl: service.imageUrl
          ? `${process.env.BASE_URL}/${service.imageUrl.url}`
          : null,
      };
      if (service.attachments && service.attachments.length) {
        data.attachments = fetchFiles(service.attachments);
      }
      type.services.push(data);
    });
    return type;
  }

  async findAll(templeId: string, user: UserAndRole) {
    const serviceTypes = await this.prisma.serviceType.findMany({
      where: {
        services: { some: { temple: { templeId: templeId }, isActive: true } },
        isActive: true,
        type: { not: 'Donation' },
      },
      include: {
        imageUrl: true,
        services: {
          where: { isActive: true },
          include: { imageUrl: true },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
    const services = [];
    serviceTypes.forEach((it) => {
      const type: any = {
        id: it.id,
        type: it.type,
        imageUrl: it.imageUrl
          ? `${process.env.BASE_URL}/${it.imageUrl.url}`
          : null,
        serviceType: it.type === VASTRAM ? GENERIC : REQURING,
        description: it.description || null,
        services: [],
      };
      it.services?.forEach((service) => {
        type.services.push({
          id: service.id,
          title: service.title,
          description: service.description,
          note: service.note,
          price: service.price,
          currency: service.currency,
          occurence: service.occurence,
          occurenceType: service.occurenceType,
          dates: service.dates,
          prebookCutOff: service.prebookCutOff,
          imageUrl: service.imageUrl
            ? `${process.env.BASE_URL}/${service.imageUrl.url}`
            : null,
        });
      });
      services.push(type);
    });
    return services;
  }

  async getAll() {
    return await this.prisma.serviceType.findMany({
      where: { isActive: true },
    });
  }
  /*update(id: number, updateServiceTypeDto: UpdateServiceTypeDto) {
    return `This action updates a #${id} serviceType`;
  }

  remove(id: number) {
    return `This action removes a #${id} serviceType`;
  }*/
}
