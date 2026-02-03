import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class AttachmentService {
  constructor(private readonly prisma: PrismaService) {}

  async remove(id: string) {
    try {
      const data = await this.prisma.attachment.findUnique({ where: { id } });
      if (!data) {
        throw new BadRequestException('Invalid request, attachment not found');
      }
      await fs.unlink(path.join('public', data.url));
      await this.prisma.attachment.delete({ where: { id } });
      return true;
    } catch (error) {
      console.log('error>>>', error);
      return false;
    }
  }
}
