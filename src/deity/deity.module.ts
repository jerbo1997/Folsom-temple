import { Module } from '@nestjs/common';
import { DeityService } from './deity.service';
import { DeityController } from './deity.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports:[PrismaModule],
  controllers: [DeityController],
  providers: [DeityService],
})
export class DeityModule {}
