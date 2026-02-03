import { Module } from '@nestjs/common';
import { ServiceCalendarService } from './service-calendar.service';
import { ServiceCalendarController } from './service-calendar.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ServiceCalendarController],
  providers: [ServiceCalendarService],
})
export class ServiceCalendarModule { }
