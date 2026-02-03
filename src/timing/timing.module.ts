import { Module } from '@nestjs/common';
import { TimingService } from './timing.service';
import { TimingController } from './timing.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TimingController],
  providers: [TimingService],
})
export class TimingModule { }
