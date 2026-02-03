import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from 'src/user/user.model';
import { TEMPLE_ID } from 'src/const';
import { Prisma } from '@prisma/client';
import { Asset } from './asset.model';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AssetService {
  constructor(
    private readonly prisma: PrismaService,
    private userService: UserService,
  ) {}
  async create(input: CreateAssetDto, user: User) {
    const data: Prisma.AssetCreateInput = {
      title: input.title,
      type: input.type,
      quantity: input.quantity,
      description: input.description,
      value: input.value,
      createdBy: { connect: { id: user.id } },
      temple: { connect: { templeId: TEMPLE_ID } },
    };
    if (input.mobile) {
      const userData = {
        name: input.name,
        mobile: input.mobile,
        countryCode: input.countryCode,
        rasi: input.rasi,
        star: input.star,
        gothram: input.gothram,
      };
      const newUser = await this.userService.findOrCreateUserByMobile(userData);
      data.donatedBy = { connect: { id: newUser.id } };
    }
    return await this.prisma.asset.create({
      data,
      include: {
        attachments: true,
        createdBy: { include: { address: true } },
        donatedBy: { include: { address: true } },
      },
    });
  }

  async findAll(startDate: Date, endDate: Date) {
    const whereArgs: Prisma.AssetWhereInput = {
      temple: { templeId: TEMPLE_ID },
      isActive: true,
    };
    if (startDate && endDate) {
      whereArgs.createdAt = {
        gte: startDate,
        lte: endDate,
      };
    }
    const result = await this.prisma.asset.findMany({
      where: whereArgs,
      include: {
        attachments: true,
        createdBy: { include: { address: true } },
        donatedBy: { include: { address: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    result.forEach((it) => {
      it.attachments.forEach((data) => {
        data.url = process.env.BASE_URL + data.url;
      });
    });
    return result;
  }

  async findOne(id: string) {
    const result = await this.prisma.asset.findUnique({
      where: { id, temple: { templeId: TEMPLE_ID }, isActive: true },
      include: {
        attachments: true,
        createdBy: { include: { address: true } },
        donatedBy: { include: { address: true } },
      },
    });
    if (!result) {
      throw new BadRequestException('Asset not found');
    }
    result.attachments.forEach((data) => {
      data.url = process.env.BASE_URL + data.url;
    });
    return result;
  }

  async update(id: string, data: UpdateAssetDto) {
    return await this.prisma.asset.update({
      where: { id },
      data,
      include: {
        attachments: true,
        createdBy: { include: { address: true } },
        donatedBy: { include: { address: true } },
      },
    });
  }

  async remove(data: Asset) {
    //Remove the corresponding file
    await this.prisma.asset.update({
      where: { id: data.id },
      data: { isActive: false },
    });
    return true;
  }

  async filesUpload(
    id: string,
    files: Express.Multer.File[],
    data: Asset,
    user: User,
  ) {
    if (data.attachments.length) {
      if (
        data.attachments.length + files.length >
        Number(process.env.MAX_FILES_COUNT)
      ) {
        throw new BadRequestException('Invalid file input');
      }
    }
    const assetsInput: Prisma.AttachmentCreateManyAssetInput[] = [];
    files.forEach((it) => {
      assetsInput.push({
        mime: it.mimetype,
        url: it.path.replace('public/', ''),
        userId: user.id,
      });
    });
    const result = await this.prisma.asset.update({
      where: { id },
      data: {
        attachments: {
          createMany: { data: assetsInput },
        },
      },
      include: { attachments: true },
    });
    result.attachments.forEach((it) => {
      it.url = process.env.BASE_URL + it.url;
    });
    return result;
  }
}
