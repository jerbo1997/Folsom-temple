import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDeityDto } from './dto/create-deity.dto';
import { UpdateDeityDto } from './dto/update-deity.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { fetchFiles, unlinkFile, uploadFile } from 'src/utils/helperFunction';
import { DEITY } from 'src/const';
import { Deity } from './deity.model';

@Injectable()
export class DeityService {
  constructor(private readonly prisma: PrismaService) { }
  async create(
    templeId: string,
    input: CreateDeityDto,
    files: Express.Multer.File[],
  ) {
    const temple = await this.prisma.temple.findUnique({
      where: { templeId: templeId },
    });
    if (!temple) {
      throw new NotFoundException(`Temple not found`);
    }
    const data: Prisma.DeityCreateInput = {
      title: input.title,

      temple: { connect: { templeId: templeId } },
    };
    if (input.description) {
      data.description = input.description;
    }
    if (input.detail) {
      data.detail = input.detail;
    }
    if (input.tag) {
      data.tag = input.tag;
    }
    if (input.specialName) {
      data.specialName = input.specialName;
    }
    if (files) {
      const url = await uploadFile(files, DEITY);
      data.imageUrl = url;
    }

    const deity = await this.prisma.deity.create({ data });
    if (deity.imageUrl && deity.imageUrl.length) {
      deity.imageUrl = await fetchFiles(deity.imageUrl)
    }
    return deity
  }

  async findAll() {
    const deities = await this.prisma.deity.findMany();
    deities.forEach(async (it) => {
      if (it.imageUrl && it.imageUrl.length) { it.imageUrl = await fetchFiles(it.imageUrl) }
    })
    return deities;
  }

  async findOne(id: string) {
    const deity = await this.prisma.deity.findUnique({ where: { id } });
    if (!deity) {
      throw new NotFoundException('Deity not found');
    }
    if (deity.imageUrl && deity.imageUrl.length) {
      deity.imageUrl = await fetchFiles(deity.imageUrl)
    }
    return deity;
  }

  async update(
    id: string,
    updateDeityDto: UpdateDeityDto,
    files: Express.Multer.File[],
  ) {
    const data: Prisma.DeityUpdateInput = {}
    if (updateDeityDto.title) {
      data.title = updateDeityDto.title
    }
    if (updateDeityDto.description) {
      data.description = updateDeityDto.description
    }
    if (updateDeityDto.detail) {
      data.detail = updateDeityDto.detail
    }
    if (updateDeityDto.specialName && updateDeityDto.specialName.length) {
      data.specialName = updateDeityDto.specialName
    }
    if (updateDeityDto.tag && updateDeityDto.tag.length) {
      data.tag = updateDeityDto.tag
    }

    const deity = await this.findOne(id);
    if (files.length) {
      if (deity.imageUrl.length) {
        const currentFileUrls = deity.imageUrl;
        for (const url of currentFileUrls) {
          const parts = url.split('deity/');
          const filename = parts[parts.length - 1];
          const pathName = `deity/${filename}`;
          const dirName = __dirname;
          unlinkFile(dirName, pathName);
        }
      }
      const newUrl = uploadFile(files, DEITY);
      data.imageUrl = newUrl;
    }

    return await this.prisma.deity.update({ where: { id }, data });
  }

  async remove(id: string, deity: Deity) {
    if (deity.imageUrl.length) {
      const currentFileUrls = deity.imageUrl;
      for (const url of currentFileUrls) {
        const parts = url.split('deity/');
        const filename = parts[parts.length - 1];
        const pathName = `deity/${filename}`;
        const dirName = __dirname;
        unlinkFile(dirName, pathName);
      }
    }

    return await this.prisma.deity.delete({ where: { id } });
  }
}
