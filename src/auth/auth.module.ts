import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../user/user.module';
import { AuthService } from './auth.service';
import { BearerStrategy } from './bearer.strategy';
import { UserService } from 'src/user/user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthController } from './auth.controller';
import { FirebaseModule } from 'src/firebase/fireBase.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [AuthController],
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET_APP,
    }),
    UserModule,
    PassportModule,
    FirebaseModule,
  ],
  providers: [AuthService, BearerStrategy, UserService, PrismaService],
  exports: [AuthService, BearerStrategy],
})
export class AuthModule {}
