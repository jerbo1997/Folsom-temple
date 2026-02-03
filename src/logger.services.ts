import { Injectable } from '@nestjs/common';
import * as winston from 'winston';

@Injectable()
export class LoggerService {
  private readonly months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  private readonly date = new Date();
  private readonly logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),

      transports: [
        new winston.transports.File({
          filename: `logs/log-${
            this.months[this.date.getMonth()]
          }-${this.date.getFullYear()}`,
        }),
        new winston.transports.Console(),
      ],
    });
  }
  logData(data: any) {
    data.timestamp = new Date();
    this.logger.log('info', JSON.stringify(data));
  }
}
