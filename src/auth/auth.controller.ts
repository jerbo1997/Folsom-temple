import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { BearerAuthGuard } from './bearer-auth.guard';
import { ErrorResponse } from 'src/utils/common/common.model';
import { LoginSwagger } from 'src/utils/swagger/auth.swagger';
import { Login } from './auth.model';
import { CreateCountryCodeDto } from 'src/user/dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { ROLE_ADMIN, ROLE_USER } from 'src/const';
import { ApiAuthGuard } from './jwt-auth.guard';
import { PrismaService } from 'src/prisma/prisma.service';

@ApiTags('auth')
@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
@ApiBadRequestResponse({
  type: ErrorResponse,
})
@ApiBearerAuth()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) { }

  @UseGuards(BearerAuthGuard)
  @ApiOkResponse({
    type: LoginSwagger,
  })
  @ApiOperation({ summary: 'Login user' })
  @Post('login')
  async login(@Body() body: CreateCountryCodeDto, @Req() req) {
    const accessToken = await this.authService.login(req.user);
    const token = {
      accessToken: accessToken.accessToken,
      role: accessToken.role,
      isUserUpdated: accessToken.isUserUpdated,
    };
    return {
      message: 'Token generated successfully',
      result: new Login(token),
    };
  }

  @UseGuards(ApiAuthGuard)
  @Post('refresh/token')
  @ApiOkResponse({
    type: LoginSwagger, // Define the type of the response
  })
  @ApiHeader({ name: 'role', enum: [ROLE_USER, ROLE_ADMIN] })
  async refreshToken(@Req() req) {
    const token: string = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new BadRequestException(
        'Authorisation token missing in the request',
      );
    }
    let secret: string;
    switch (req.headers.role) {
      case undefined:
        throw new BadRequestException('Invalid role passed in the request');
      case ROLE_USER: {
        secret = process.env.JWT_SECRET_APP;
        break;
      }
      case ROLE_ADMIN: {
        secret = process.env.JWT_SECRET_ADMIN;
        break;
      }
    }
    const newToken = await this.authService.refreshToken(token, secret);
    return {
      message: 'Token refresh successful',
      result: new Login(newToken),
    };
  }
}
