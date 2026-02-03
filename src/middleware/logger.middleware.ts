import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response, Request } from 'express';
import { LoggerService } from 'src/logger.services';
import { v4 as uuid } from 'uuid';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: LoggerService) {}
  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const { ip, method } = req;
    const userAgent = req.get('user-agent') || uuid();
    res.on('finish', () => {
      const endTime = Date.now();
      const responseTime = `${endTime - startTime}ms`;
      const { statusCode, statusMessage } = res;
      const contentLength = res.get('content-length');
      this.logger.logData({
        method,
        body: req.body,
        phone: (req.user as any)?.mobile || '',
        role: req.headers.role || null,
        path: req.originalUrl,
        statusCode,
        statusMessage,
        responseTime,
        // ip,
        content_length: contentLength,
        user_agent: userAgent,
      });
      req.user = null;
    });
    next();
  }
}
