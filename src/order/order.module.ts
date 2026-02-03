import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RazorPayService } from 'src/razor-pay/razor-pay.service';
import { UserService } from 'src/user/user.service';
import { NotificationService } from 'src/notification/notification.service';
import { FirebaseService } from 'src/firebase/fireBase.service';
import { StripeService } from 'src/stripe/stripe.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Module({
  imports: [PrismaModule,ConfigModule],
  controllers: [OrderController],
  providers: [
    OrderService,
    RazorPayService,
    UserService,
    NotificationService,
    FirebaseService,
    StripeService,
    {
      provide: 'STRIPE',
      useFactory: (configService: ConfigService) => {
        return new Stripe(configService.get<string>('STRIPE_SECRET_KEY'));
      },
      inject: [ConfigService],
    },
  ],
})
export class OrderModule {}
