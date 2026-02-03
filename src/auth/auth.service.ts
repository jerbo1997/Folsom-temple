import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import { User } from 'src/user/user.model';
import { EXPIRES_IN, ROLE_USER } from 'src/const';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  /*async validateUser(phoneNumber: string, otp: string) {
    const user = await this.usersService.findOne(phoneNumber);
    if (user && otp === '123456') {
      return user;
    }
    return null;
  }*/

  async login(user: User) {
    const existingUser = await this.prisma.user.findUnique({
      where: { mobile: user.mobile },
      include: { role: true },
    });
    if (user.mobile && user.email) {
      const payload = {
        userId: user.id,
        role: existingUser.role.name,
      };
      if (payload.role === ROLE_USER) {
        return {
          accessToken: this.jwtService.sign(payload, { expiresIn: EXPIRES_IN }),
          role: payload.role,
          isUserUpdated: true,
        };
      } else {
        return {
          accessToken: this.jwtService.sign(payload, {
            expiresIn: EXPIRES_IN,
            secret: process.env.JWT_SECRET_ADMIN,
          }),
          role: payload.role,
          isUserUpdated: true,
        };
      }
    } else {
      const payload = {
        userId: user.id,
        role: existingUser.role.name,
      };
      return {
        accessToken: this.jwtService.sign(payload, {
          expiresIn: EXPIRES_IN,
        }),
        isUserUpdated: false,
      };
    }
  }

  async refreshToken(token: string, secret: string) {
    try {
      const parseToken: any = this.jwtService.verify(token, {
        secret,
        ignoreExpiration: true,
      });
      let payload = {
        userId: parseToken.userId,
        role: parseToken.role,
      };
      let newToken = this.jwtService.sign(payload, {
        secret,
        expiresIn: EXPIRES_IN,
      });
      return {
        accessToken: newToken,
        role: payload.role,
        isUserUpdated: true,
      };
    } catch (error) {
      if (error) {
        console.log('err>>>>', error);
        throw new BadRequestException('Invalid Token');
      }
    }
  }
}
