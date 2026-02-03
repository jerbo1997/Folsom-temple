import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { User } from 'src/user/user.model';
import { ROLE_USER } from 'src/const';
import { Property, RentalStatusEnum } from './property.model';

@Injectable()
export class PropertyService {
  constructor(private readonly prisma: PrismaService) {}
  async create(input: CreatePropertyDto, user: User) {
    const temple = await this.prisma.temple.findFirst({
      where: { templeId: 'Temple-1' },
    });
    if (!temple) {
      throw new NotFoundException('Temple not found');
    }
    const data: Prisma.PropertyCreateInput = {
      name: input.name,
      description: input.description || undefined,
      fees: input.fees || undefined,
      address: input.address
        ? {
            create: {
              addressLine1: input.address,
              city: input.city,
              state: input.state,
              pinCode: input.pincode,
            },
          }
        : undefined,
      status: input.rental?.phoneNumber ? 'RENTED_OUT' : 'AVAILABLE',
      temple: { connect: { templeId: temple.templeId } },
      createdBy: {
        connect: { id: user.id },
      },
    };
    if (input.rental?.phoneNumber) {
      data.rentals = {
        create: {
          name: input.rental.userName,
          phoneNumber: input.rental.phoneNumber,
          noOfDays: input.rental.noOfDays,
          fees: input.fees,
          startDate: input.rental.startDate,
          endDate: input.rental.endDate,
          address: input.rental.address
            ? {
                create: {
                  name: input.rental.userName,
                  mobile: input.rental.phoneNumber,
                  addressLine1: input.rental.address,
                  city: input.rental.city,
                  state: input.rental.state || undefined,
                  pinCode: input.rental.pincode,
                },
              }
            : undefined,
          createdBy: { connect: { id: user.id } },
          temple: { connect: { templeId: temple.templeId } },
        },
      };
    }
    return await this.prisma.property.create({
      data,
      include: {
        image: true,
        address: true,
        rentals: {
          include: { createdBy: true, address: true },
          orderBy: { createdAt: 'desc' },
        },
        createdBy: true,
      },
    });
  }

  async findAll(user: User) {
    const userData = await this.prisma.user.findFirst({
      where: { id: user.id },
      select: { role: true },
    });
    const args: Prisma.PropertyFindManyArgs = {
      include: {
        image: true,
        address: true,
        rentals: {
          include: { createdBy: true, address: true },
          orderBy: { createdAt: 'desc' },
        },
        createdBy: true,
      },
      where: { templeId: 'Temple-1' },
      orderBy: { createdAt: 'desc' },
    };
    if (userData.role.name === ROLE_USER) {
      args.where.status =
        RentalStatusEnum.AVAILABLE.toString() as Prisma.EnumRentalStatusFilter<'Property'>;
    }
    const properties: any = await this.prisma.property.findMany(args);
    if (properties.length) {
      properties.forEach((it) => {
        if (it.image?.url) {
          it.image.url = process.env.BASE_URL + '/' + it.image.url;
        }
      });
    }
    return properties;
  }

  async findOne(id: string) {
    const property = await this.prisma.property.findFirst({
      where: { id },
      include: {
        image: true,
        address: true,
        rentals: {
          include: { createdBy: true, address: true },
          orderBy: { createdAt: 'desc' },
        },
        createdBy: true,
      },
    });
    if (!property) {
      throw new NotFoundException('Property not found');
    }
    if (property?.image?.url) {
      property.image.url = process.env.BASE_URL + '/' + property.image.url;
    }
    return property;
  }

  async update(
    id: string,
    input: UpdatePropertyDto,
    user: User,
    property: Property,
  ) {
    const temple = await this.prisma.temple.findFirst({
      where: { templeId: 'Temple-1' },
    });
    if (!temple) {
      throw new NotFoundException('Temple not found');
    }
    const data: Prisma.PropertyUpdateInput = {
      name: input.name,
      fees: input.fees,
      description: input.description,
      address: input.address
        ? {
            create: {
              addressLine1: input.address,
              city: input.city,
              state: input.state,
              pinCode: input.pincode,
            },
          }
        : undefined,
      status: input.status,
    };
    if (input.rental?.phoneNumber) {
      data.status = 'RENTED_OUT';
      data.rentals = {
        create: {
          name: input.rental.userName,
          phoneNumber: input.rental.phoneNumber,
          noOfDays: input.rental.noOfDays,
          fees: input.fees,
          startDate: input.rental.startDate,
          endDate: input.rental.endDate,
          address: input.rental.address
            ? {
                create: {
                  name: input.rental.userName,
                  mobile: input.rental.phoneNumber,
                  addressLine1: input.rental.address,
                  city: input.rental.city,
                  state: input.rental.state,
                  pinCode: input.rental.pincode,
                },
              }
            : undefined,
          createdBy: { connect: { id: user.id } },
          temple: { connect: { templeId: temple.templeId } },
        },
      };
    }
    if ([RentalStatusEnum.RETURNED].includes(RentalStatusEnum[input.status])) {
      if (input.remarks) {
        data.rentals = {
          update: {
            where: { id: property.rentals[0].id },
            data: {
              remarks: input.remarks,
            },
          },
        };
      }
      data.status = 'AVAILABLE';
    }
    return await this.prisma.property.update({
      where: { id },
      data,
      include: {
        image: true,
        address: true,
        rentals: {
          include: { createdBy: true, address: true },
          orderBy: { createdAt: 'desc' },
        },
        createdBy: true,
      },
    });
  }

  async fileUpload(id: string, file: Express.Multer.File, user: User) {
    const property = await this.prisma.property.update({
      where: { id },
      data: {
        image: {
          create: {
            mime: file.mimetype,
            url: file.path.replace('public/', ''),
            userId: user.id,
          },
        },
      },
      include: { image: true },
    });
    if (property?.image?.url) {
      property.image.url = process.env.BASE_URL + '/' + property.image.url;
    }
    return property;
  }
}
