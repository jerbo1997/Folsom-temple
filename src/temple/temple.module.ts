import { Module } from '@nestjs/common';
import { TempleService } from './temple.service';
import { TempleController } from './temple.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TempleController],
  providers: [TempleService],
})
export class TempleModule { }
