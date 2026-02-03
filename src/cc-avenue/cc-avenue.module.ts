import { Module } from '@nestjs/common';
import { CcAvenueService } from './cc-avenue.service';
import { CcAvenueController } from './cc-avenue.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [CcAvenueController],
  providers: [CcAvenueService, PrismaService],
})
export class CcAvenueModule {}
