import {
  Controller,
  Get,
  Param,
  ClassSerializerInterceptor,
  UseInterceptors,
  UseGuards,
  Query,
  Post,
  Body,
  NotFoundException,
  Put,
  BadRequestException,
} from '@nestjs/common';
import { ServiceCalendarService } from './service-calendar.service';
import { Permissions } from 'src/auth/permissions.decorator';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ServiceCalendarSwagger } from 'src/utils/swagger/service-calendar.swagger';
import { ServiceCalendars } from './service-calendar.model';
import { UserAndRole } from 'src/user/user.model';
import { CurrentUser } from 'src/utils/decorators/current-user.decorator';
import { ErrorResponse } from 'src/utils/common/common.model';
import { ApiAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/permissions.guard';
import {
  CREATE_AMAVASYA,
  GET_ALL_SERVICECALENDARS,
  UPDATE_SERVICE_CALENDAR,
} from 'src/auth/permissions.const';
import { ROLE_ADMIN, ROLE_GUEST, ROLE_USER } from 'src/const';
import { CreateServiceCalendarDto } from './dto/create-service-calendar.dto';
import { UpdateServiceCalendarDto } from './dto/update-service-calendar.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@ApiTags('serviceCalendar')
@ApiBadRequestResponse({
  type: ErrorResponse,
})
@UseGuards(ApiAuthGuard, RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@ApiBearerAuth()
@Controller('serviceCalendar')
export class ServiceCalendarController {
  constructor(
    private readonly serviceCalendarService: ServiceCalendarService,
    private readonly prisma: PrismaService,
  ) {}

  @Permissions(CREATE_AMAVASYA)
  @ApiHeader({ name: 'role', enum: [ROLE_ADMIN, ROLE_USER, ROLE_GUEST] })
  @Post(':serviceId')
  async createServiceCalendar(
    @Param('serviceId') serviceId: string,
    @Body() dates: CreateServiceCalendarDto,
  ) {
    await this.serviceCalendarService.createServiceCalendar(serviceId, dates);
    return {
      message: 'ServiceCalendars created successfully',
    };
  }

  @Permissions(GET_ALL_SERVICECALENDARS)
  @ApiHeader({ name: 'role', enum: [ROLE_ADMIN, ROLE_USER, ROLE_GUEST] })
  @Get(':templeId')
  @ApiQuery({
    name: 'serviceTypeId',
    example: 'clmk5frux003tpro6c30q4mvp',
    type: 'string',
    required: false,
  })
  @ApiQuery({
    name: 'date',
    example: '2023-09-19T06:50:23.765Z',
    type: 'string',
    required: false,
  })
  @ApiQuery({
    name: 'startDate',
    example: '2023-09-19T06:50:23.765Z',
    type: 'string',
    required: false,
  })
  @ApiQuery({
    name: 'endDate',
    example: '2023-09-19T06:50:23.765Z',
    type: 'string',
    required: false,
  })
  @ApiOperation({ summary: 'Fetch All ServiveCalendars' })
  @ApiOkResponse({
    type: ServiceCalendarSwagger,
  })
  async findAll(
    @Param('templeId') templeId: string,
    @CurrentUser() user: UserAndRole,
    @Query('serviceTypeId') serviceTypeId: string,
    @Query('date') date: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    if ((startDate && !endDate) || (endDate && !startDate)) {
      throw new BadRequestException('startDate or endDate should be required');
    }
    if (date && (startDate || endDate)) {
      throw new BadRequestException(
        'Either date or (startDate & endDate) should give as a input',
      );
    }
    const serviceCalendars = await this.serviceCalendarService.findAll(
      templeId,
      user,
      serviceTypeId,
      date,
      startDate,
      endDate,
    );
    return {
      message: 'ServiceCalendars fetched successfully',
      result: serviceCalendars.map((it) => new ServiceCalendars(it)),
    };
  }

  @Put()
  @ApiHeader({ name: 'role', enum: [ROLE_ADMIN] })
  @Permissions(UPDATE_SERVICE_CALENDAR)
  async update(@Body() updateServiceCalendarDto: UpdateServiceCalendarDto) {
    const serviceCalendars = await this.prisma.serviceCalendar.findMany({
      where: { id: { in: updateServiceCalendarDto.calendarIds } },
    });
    if (
      serviceCalendars.length !== updateServiceCalendarDto.calendarIds.length
    ) {
      throw new NotFoundException('invalid service calendars');
    }
    const updatedCalendars = this.serviceCalendarService.update(
      updateServiceCalendarDto,
    );
    return {
      message: 'Service Calendar Updated Successfully',
      result: updatedCalendars,
    };
  }

  /*@Permissions()
  @Get(':id')
  @ApiOperation({ summary: 'Fetch serviceCalendar' })
  @ApiOkResponse({
    type: ServiceCalendarSwaggerById,
  })
  async findOne(@Param('id') id: string) {
    const serviceCalendar = await this.serviceCalendarService.findOne(id);
    return {
      message: 'ServiceCalendar Fetched successfully',
      result: new ServiceCalendar(serviceCalendar),
    };
  }

   @Patch(':id')
 

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.serviceCalendarService.remove(+id);
  }*/
}
