import {
  Controller,
  Get,
  Patch,
  Param,
  UseGuards,
  BadRequestException,
  NotFoundException,
  UseInterceptors,
  ClassSerializerInterceptor,
  Body,
  Put,
  Post,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { ApiAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from 'src/utils/decorators/current-user.decorator';
import { User } from 'src/user/user.model';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ErrorResponse } from 'src/utils/common/common.model';
import { ROLE_ADMIN, ROLE_USER } from 'src/const';
import { NotificationSwagger } from 'src/utils/swagger/notification.swagger';
import { Permissions } from 'src/auth/permissions.decorator';
import {
  CREATE_NOTIFICATION,
  MY_NOTIFICATION,
  NOTIFICATION,
  UPDATE_NOTIFICATION,
} from 'src/auth/permissions.const';
import { RolesGuard } from 'src/auth/permissions.guard';
import { Notification } from './notification.model';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { CreateNotificationDto } from './dto/create-notification.dto';

@ApiTags('notification')
@ApiBadRequestResponse({
  type: ErrorResponse,
})
@UseInterceptors(ClassSerializerInterceptor)
@Controller('notification')
@ApiBearerAuth()
@UseGuards(ApiAuthGuard, RolesGuard)
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly prisma: PrismaService,
  ) {}

  @Permissions(CREATE_NOTIFICATION)
  @Post()
  @ApiHeader({ name: 'role', enum: [ROLE_ADMIN] })
  @ApiOperation({ summary: 'create notification' })
  @ApiOkResponse({ type: NotificationSwagger })
  @ApiBody({ type: CreateNotificationDto })
  async createNotification(
    @CurrentUser() user: User,
    @Body() createNotificationDto: CreateNotificationDto,
  ) {
    const userData = await this.prisma.user.findUnique({
      where: { id: user.id },
    });
    if (!userData) {
      throw new NotFoundException('User not found');
    }
    const updatedNotification =
      await this.notificationService.createNotification(createNotificationDto);
    if (updatedNotification) {
      return {
        message: 'Notification sent Sucessfully',
        result: null,
      };
    }
  }

  @Permissions(MY_NOTIFICATION)
  @Get('myNotifications')
  @ApiHeader({ name: 'role', enum: [ROLE_ADMIN, ROLE_USER] })
  @ApiOperation({ summary: 'Get all notifications' })
  @ApiOkResponse({ type: NotificationSwagger })
  async findAll(@CurrentUser() user: User) {
    if (!user) {
      throw new BadRequestException(`user Not Found`);
    }
    const notification: any = await this.notificationService.findAll(user);
    return {
      message: 'notification fetched Sucessfully',
      result: notification.map((it) => new Notification(it)),
    };
  }

  @Permissions(NOTIFICATION)
  @Get(':id')
  @ApiHeader({ name: 'role', enum: [ROLE_ADMIN, ROLE_USER] })
  @ApiOperation({ summary: 'Get notification by id' })
  @ApiOkResponse({ type: NotificationSwagger })
  async findOne(@Param('id') id: string, @CurrentUser() currentUser: User) {
    const notification = await this.prisma.notification.findFirst({
      where: { id },
    });
    if (!notification) {
      throw new NotFoundException(
        'Notification not found for this particular id',
      );
    }
    if (currentUser.id !== notification.userId) {
      throw new BadRequestException('User access Denied');
    }
    const userNotification: any = await this.notificationService.findOne(id);
    return {
      message: 'notification fetched Sucessfully',
      result: new Notification(userNotification),
    };
  }

  @Permissions(UPDATE_NOTIFICATION)
  @Put()
  @ApiHeader({ name: 'role', enum: [ROLE_ADMIN, ROLE_USER] })
  @ApiOperation({ summary: 'Update notification' })
  @ApiOkResponse({ type: NotificationSwagger })
  @ApiBody({ type: UpdateNotificationDto })
  async updateNotification(
    @CurrentUser() user: User,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ) {
    const userData = await this.prisma.user.findUnique({
      where: { id: user.id },
    });
    if (!userData) {
      throw new NotFoundException('User not found');
    }
    if (updateNotificationDto.id) {
      const notification = await this.notificationService.findOne(
        updateNotificationDto.id,
      );
      if (!notification) {
        throw new NotFoundException(
          'Notification not found for this particular id',
        );
      }
      if (notification.userId !== user.id) {
        throw new BadRequestException('User access Denied');
      }
    }
    const updatedNotification: any = await this.notificationService.update(
      user,
      updateNotificationDto,
    );
    return {
      message: 'notification updated Sucessfully',
      result: new Notification(updatedNotification),
    };
  }
}
