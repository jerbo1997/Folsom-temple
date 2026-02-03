import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from 'src/user/user.model';
import { Prisma } from '@prisma/client';

@Injectable()
export class AddressService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createAddressDto: CreateAddressDto, user: User) {
    const data = await this.prisma.address.create({
      data: {
        addressLine1: createAddressDto.addressLine1,
        addressLine2: createAddressDto.addressLine2,
        city: createAddressDto.city,
        country: createAddressDto.country,
        landmark: createAddressDto.landmark,
        mobile: createAddressDto.mobile,
        name: createAddressDto.name,
        state: createAddressDto.state,
        type: createAddressDto.type,
        pinCode: createAddressDto.pinCode,
        user: { connect: { id: user.id } },
        tag: createAddressDto.tag,
      },
    });
    return data;
  }

  async findAll(user: User) {
    const data = await this.prisma.address.findMany({
      where: { isActive: true, userId: user.id },
      orderBy: { createdAt: 'desc' },
    });
    return data;
  }

  async findOne(id: string) {
    const data = await this.prisma.address.findUnique({
      where: { id, isActive: true },
      include: { user: true },
    });
    if (!data) {
      throw new NotFoundException(`Address not found`);
    }
    return data;
  }

  async update(id: string, updateAddressDto?: UpdateAddressDto) {
    const updateData: Prisma.AddressUpdateInput = {
      addressLine1: updateAddressDto.addressLine1,
      addressLine2: updateAddressDto.addressLine2,
      city: updateAddressDto.city,
      country: updateAddressDto.country,
      landmark: updateAddressDto.landmark,
      mobile: updateAddressDto.mobile,
      name: updateAddressDto.name,
      state: updateAddressDto.state,
      type: updateAddressDto.type,
      pinCode: updateAddressDto.pinCode,
      tag: updateAddressDto.tag,
    };

    const data = await this.prisma.address.update({
      where: { id },
      data: updateData,
    });

    return data;
  }

  async remove(id: string) {
    const data = await this.prisma.address.update({
      where: { id },
      data: { isActive: false },
    });
    return data;
  }
}
