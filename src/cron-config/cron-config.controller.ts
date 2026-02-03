import { Controller } from '@nestjs/common';
import { CronConfigService } from './cron-config.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Controller('cron-config')
export class CronConfigController {
  constructor(
    private readonly cronConfigService: CronConfigService,
  ) { }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async createCalendar() {
    await this.cronConfigService.createCalendar();
  }
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async disableService() {
    await this.cronConfigService.disableService();
  }
  @Cron(CronExpression.EVERY_DAY_AT_7AM)
  async notificationAtNoonForEvent() {
    await this.cronConfigService.notificationAtNoonForEvent();
  }
  @Cron(CronExpression.EVERY_DAY_AT_2PM)
  async notificationAtEveningForEvent() {
    await this.cronConfigService.notificationAtEveningForEvent();
  }
}
