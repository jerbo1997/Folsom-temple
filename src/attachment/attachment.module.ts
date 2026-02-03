import { Module } from '@nestjs/common';
import { AttachmentService } from './attachment.service';
import { AttachmentController } from './attachment.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [AttachmentController],
  providers: [AttachmentService, PrismaService],
})
export class AttachmentModule {}
