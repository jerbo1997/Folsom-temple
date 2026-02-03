import { Controller, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiAuthGuard } from 'src/auth/jwt-auth.guard';
import { RazorPayService } from './razor-pay.service';

@ApiTags('razorpay')
@UseGuards(ApiAuthGuard)
@Controller('razorpay')
export class RazorPayController {
  constructor(private readonly razorpayService: RazorPayService) { }
}
