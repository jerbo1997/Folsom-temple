import {
  BadRequestException,
  Controller,
  Param,
  Post,
  RawBodyRequest,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { CcAvenueService } from './cc-avenue.service';
import { CustomResponseFilter } from '../utils/exceptions/custom-response.filter';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from 'src/utils/decorators/current-user.decorator';
import { UserAndRole } from 'src/user/user.model';
import { Request } from 'express';

@Controller('cc-avenue')
export class CcAvenueController {
  constructor(
    private readonly ccAvenueService: CcAvenueService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('initiate/:orderId')
  @UseGuards(ApiAuthGuard)
  @UseFilters(CustomResponseFilter)
  async initiatePayment(
    @Param('orderId') orderId: string,
    @CurrentUser() user: UserAndRole,
  ) {
    const order = await this.prisma.order.findFirst({
      where: { orderId, createdById: user.id },
      include: {
        address: true,
        cart: true,
        createdFor: true,
        createdBy: true,
      },
    });
    if (!order) {
      throw new BadRequestException(
        'Sorry something went wrong order not found',
      );
    }
    await this.ccAvenueService.initiatePayment(order);
  }

  @Post('payments/webhook')
  async webhook(@Req() req: RawBodyRequest<Request>) {
    await this.ccAvenueService.webhook(req.body);
    return { message: 'Order status received successfully' };
  }
}
