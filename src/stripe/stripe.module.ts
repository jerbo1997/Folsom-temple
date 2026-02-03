import { Module } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [
    {
      provide: 'STRIPE',
      useFactory: (configService: ConfigService) => {
        return new Stripe(configService.get<string>('STRIPE_SECRET_KEY'));
      },
      inject: [ConfigService],
    },
    StripeService,
    PrismaService,
  ],
  exports: ['STRIPE', StripeService],
  imports: [ConfigModule],
  controllers: [StripeController],
})
export class StripeModule {}
