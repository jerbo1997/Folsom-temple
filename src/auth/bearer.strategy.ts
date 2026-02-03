import { BadRequestException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { FirebaseService } from 'src/firebase/fireBase.service';
import { UserService } from '../user/user.service';
import { Strategy } from 'passport-http-bearer';
import { Request } from 'express';

@Injectable()
export class BearerStrategy extends PassportStrategy(Strategy) {
  constructor(
    private userService: UserService,
    private firebase: FirebaseService,
  ) {
    super({ passReqToCallback: true });
  }
  async validate(req: Request, token: string) {
    try {
      const data = await this.firebase.verifyToken(token);
      return await this.userService.findOrCreateUser(
        data,
        req.body.countryCode,
      );
    } catch (error) {
      console.log('err>>>>', error);
      throw new BadRequestException('Invalid token');
    }
  }
}
