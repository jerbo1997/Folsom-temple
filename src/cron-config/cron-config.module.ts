import { Module } from '@nestjs/common';
import { CronConfigService } from './cron-config.service';
import { CronConfigController } from './cron-config.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserService } from 'src/user/user.service';
import { NotificationService } from 'src/notification/notification.service';
import { FirebaseService } from 'src/firebase/fireBase.service';

@Module({
  imports: [PrismaModule],
  controllers: [CronConfigController],
  providers: [
    CronConfigService,
    UserService,
    NotificationService,
    FirebaseService,
  ],
})
export class CronConfigModule {}
