import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { PrismaService } from 'src/prisma/prisma.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { ROLE_ADMIN, ROLE_GUEST, ROLE_USER } from 'src/const';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // secretOrKey: process.env.JWT_SECRET_APP,
      secretOrKeyProvider: (req: Request, token: string, done: any) => {
        const specificHeaderKey: string = req.headers.role as string;
        if (specificHeaderKey === ROLE_GUEST) {
          done(null, process.env.JWT_FE_SECRET);
        } else if (specificHeaderKey === ROLE_USER) {
          done(null, process.env.JWT_SECRET_APP);
        } else if (specificHeaderKey === ROLE_ADMIN) {
          done(null, process.env.JWT_SECRET_ADMIN);
        } else {
          done(null, '');
        }
      },
    });
  }

  async validate(payload: any) {
    console.log('payload>>>', payload);
    if (payload.role === ROLE_GUEST) {
      const user = await this.prisma.user.findFirst({
        where: {
          isActive: true,
          role: { name: payload.role },
        },
        include: { role: { include: { permissions: true } } },
      });
      if (!user) {
        throw new UnauthorizedException('user access revoked');
      }
      return {
        id: user.id,
        name: user.name,
        countryCode: user.countryCode,
        mobile: user.mobile,
        email: user.email,
        signUpMethod: user.signUpMethod,
        imageUrl: user.imageUrl,
        role: user.role,
      };
    } else {
      const user = await this.prisma.user.findUnique({
        where: {
          id: payload.userId,
          isActive: true,
          role: { name: payload.role },
        },
        include: { role: { include: { permissions: true } } },
      });
      if (!user) {
        throw new UnauthorizedException('user access revoked');
      }
      return {
        id: user.id,
        name: user.name,
        countryCode: user.countryCode,
        mobile: user.mobile,
        email: user.email,
        signUpMethod: user.signUpMethod,
        imageUrl: user.imageUrl,
        role: user.role,
      };
    }
  }
}
