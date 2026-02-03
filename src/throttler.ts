import { ThrottlerException, ThrottlerGuard } from '@nestjs/throttler';
import {
  BadRequestException,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, any>): Promise<string> {
    return req.ips.length ? req.ips[0] : req.ip;
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      return await super.canActivate(context);
    } catch (exception) {
      if (exception instanceof ThrottlerException) {
        throw new BadRequestException(
          'Too many requests. Please try again later.',
        );
      }
    }
  }
}
