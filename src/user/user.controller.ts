import {
  Controller,
  Get,
  Body,
  UseInterceptors,
  ClassSerializerInterceptor,
  UseGuards,
  Put,
  Post,
  Param,
  BadRequestException,
  NotFoundException,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateFcm, UpdateUserDto } from './dto/update-user.dto';
import { MyUser, SyncUser, UpdateUser, User } from './user.model';
import { CurrentUser } from 'src/utils/decorators/current-user.decorator';
import { ApiAuthGuard } from 'src/auth/jwt-auth.guard';
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
import {
  UpdateUserSwagger,
  UserSwagger,
  syncUserSwagger,
} from 'src/utils/swagger/user.swagger';
import { EXPIRES_IN, ROLE_ADMIN, ROLE_GUEST, ROLE_USER } from 'src/const';
import { JwtService } from '@nestjs/jwt';
import { Permissions } from 'src/auth/permissions.decorator';
import {
  DELETE_USER,
  MY_USER,
  UPDATE_FCM_TOKEN,
  UPDATE_USER,
  USER_BY_PHONENUMBER,
} from 'src/auth/permissions.const';
import { RolesGuard } from 'src/auth/permissions.guard';
import { PrismaService } from 'src/prisma/prisma.service';

@ApiTags('users')
@Controller('users')
@UseGuards(ApiAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@ApiBadRequestResponse({
  type: ErrorResponse,
})
@ApiBearerAuth()
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) { }

  /*   @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    const result = new User(user);
    return {
      message: 'user fetched successfully',
      result,
    };
  } */

  @Post('sync')
  @UseGuards(ApiAuthGuard)
  @ApiHeader({ name: 'role', enum: [ROLE_ADMIN, ROLE_USER, ROLE_GUEST] })
  @ApiOkResponse({
    type: syncUserSwagger,
  })
  @ApiOperation({ summary: 'user Updatesession' })
  async syncUser(
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: User,
  ) {
    const userData: any = await this.userService.update(user, updateUserDto);
    const payload = {
      userId: userData.id,
      role: ROLE_USER,
    };
    const token = this.jwtService.sign(payload, { expiresIn: EXPIRES_IN });
    return {
      message: 'User synced successfully',
      result: new SyncUser({
        accessToken: token,
        isUserUpdated: true,
        user: new UpdateUser(userData),
      }),
    };
  }

  @Permissions(MY_USER)
  @UseGuards(RolesGuard)
  @ApiHeader({ name: 'role', enum: [ROLE_ADMIN, ROLE_USER, ROLE_GUEST] })
  @Get('myUser')
  @ApiOkResponse({
    type: UserSwagger,
  })
  @ApiOperation({ summary: 'fetch User' })
  async myUser(@CurrentUser() user: User) {
    const myUser: any = await this.userService.myUser(user);
    const result = new MyUser(myUser);
    return {
      message: 'User fetched successfully',
      result,
    };
  }

  @Permissions(USER_BY_PHONENUMBER)
  @UseGuards(RolesGuard)
  @ApiHeader({ name: 'role', enum: [ROLE_ADMIN, ROLE_USER, ROLE_GUEST] })
  @Get('userByMobileNumber/:mobileNumber')
  @ApiOkResponse({
    type: UserSwagger,
  })
  @ApiOperation({ summary: 'fetch User by mobileNumber' })
  async userByPhoneNumber(@Param('mobileNumber') mobileNumber: string) {
    const user: any = await this.userService.userByPhoneNumber(mobileNumber);
    const result = new MyUser({ user: user });
    return {
      message: 'User fetched successfully',
      result,
    };
  }

  @Permissions(UPDATE_USER)
  @UseGuards(RolesGuard)
  @ApiHeader({ name: 'role', enum: [ROLE_ADMIN, ROLE_USER, ROLE_GUEST] })
  @Put()
  @ApiOkResponse({
    type: syncUserSwagger,
  })
  @ApiOperation({ summary: 'Update User' })
  async update(
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: User,
  ) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id: user.id, isActive: true },
      include: { address: true },
    });
    if (!existingUser) {
      throw new NotFoundException(`User not found`);
    }
    const userUpdate = await this.userService.update(
      existingUser,
      updateUserDto,
    );
    return {
      message: 'User updated successfully',
      result: new SyncUser({
        accessToken: null,
        isUserUpdated: true,
        user: new UpdateUser(userUpdate),
      }),
    };
  }

  @Permissions(UPDATE_FCM_TOKEN)
  @UseGuards(RolesGuard)
  @ApiHeader({ name: 'role', enum: [ROLE_ADMIN, ROLE_USER] })
  @Put('updateFcm')
  @ApiOkResponse({
    type: UpdateUserSwagger,
  })
  @ApiOperation({ summary: 'Update User Fcm' })
  @ApiBody({ type: UpdateFcm, required: true })
  async updateFcmToken(
    @Body() updateFcmInput: UpdateFcm,
    @CurrentUser() user: User,
  ) {
    if (updateFcmInput.androidFcmToken && updateFcmInput.iosFcmToken) {
      throw new BadRequestException(
        `Android,iOS token cannot be updated simulataneously`,
      );
    }
    const userUpdate: any = await this.userService.updateFCM(
      updateFcmInput,
      user,
    );
    return {
      message: 'User Fcm token updated successfully',
      result: new UpdateUser(userUpdate),
    };
  }

  @Permissions(DELETE_USER)
  @UseGuards(RolesGuard)
  @ApiHeader({ name: 'role', enum: [ROLE_USER] })
  @Delete()
  async remove(@CurrentUser() user: User) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id: user.id },
    });
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }
    const result = await this.userService.remove(user);
    return {
      message: 'user deleted succesfully',
      result,
    };
  }
}
