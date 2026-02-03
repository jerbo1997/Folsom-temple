import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { PremiumBookingsService } from './premium-bookings.service';
import { CreatePremiumBookingDto } from './dto/create-premium-booking.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ApiAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/permissions.guard';
import { ErrorResponse } from 'src/utils/common/common.model';
import { ROLE_ADMIN } from 'src/const';
import { PremiumBookings } from './premium-bookings.model';
import { PremiumBookingsSwagger } from 'src/utils/swagger/premium-booking.swagger';
import {
  CREATE_PREMIUM_BOOKING,
  GET_ALL_PREMIUM_BOOKING,
  GET_PREMIUM_BOOKING,
} from 'src/auth/permissions.const';
import { Permissions } from 'src/auth/permissions.decorator';
@ApiTags('premium-bookings')
@UseGuards(ApiAuthGuard, RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@ApiBadRequestResponse({
  type: ErrorResponse,
})
@Controller('premium-bookings')
@ApiHeader({ name: 'role', enum: [ROLE_ADMIN] })
@ApiBearerAuth()
export class PremiumBookingsController {
  constructor(
    private readonly premiumBookingsService: PremiumBookingsService,
  ) {}

  @ApiOperation({ summary: 'Create new Premium Bookings' })
  @Post()
  @Permissions(CREATE_PREMIUM_BOOKING)
  @ApiOkResponse({
    type: PremiumBookingsSwagger,
  })
  async create(@Body() createPremiumBookingDto: CreatePremiumBookingDto) {
    if (createPremiumBookingDto.day || createPremiumBookingDto.englishMonth) {
      if (createPremiumBookingDto.tamilMonth) {
        throw new BadRequestException(
          'Either tamilMonth or englishMonth and day should be given',
        );
      } else if (
        !(createPremiumBookingDto.day && createPremiumBookingDto.englishMonth)
      ) {
        throw new BadRequestException('Day or englishMonth shold not be empty');
      }
    }
    const puja = await this.premiumBookingsService.create(
      createPremiumBookingDto,
    );
    const result = new PremiumBookings(puja);
    return {
      message: 'New Premium bookings created successfully',
      result,
    };
  }

  @Get(':id')
  @ApiOkResponse({
    type: PremiumBookingsSwagger,
  })
  @Permissions(GET_PREMIUM_BOOKING)
  @ApiOperation({ summary: 'Get premium Booking by id' })
  async findOne(@Param('id') id: string) {
    const data = await this.premiumBookingsService.findOne(id);
    return {
      message: 'Booking fetched successfully',
      result: new PremiumBookings(data),
    };
  }

  @ApiQuery({ name: 'month' })
  @ApiQuery({ name: 'year' })
  @Get()
  @ApiOkResponse({
    type: PremiumBookingsSwagger,
  })
  @Permissions(GET_ALL_PREMIUM_BOOKING)
  @ApiOperation({ summary: 'Get all Premium Bookings' })
  async findAll(@Query('month') month: number, @Query('year') year: number) {
    const datas = await this.premiumBookingsService.findAll(month, year);
    return {
      message: 'All booking fetched successfully',
      result: datas.map((it) => new PremiumBookings(it)),
    };
  }

  /* @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updatePremiumBookingDto: UpdatePremiumBookingDto,
  ) {
    return this.premiumBookingsService.update(+id, updatePremiumBookingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.premiumBookingsService.remove(+id);
  } */
}
