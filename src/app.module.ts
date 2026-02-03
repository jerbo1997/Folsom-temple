import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { JwtStrategy } from './auth/jwt.strategy';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { TransformInterceptor } from './utils/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './utils/exceptions/all-exception.filter';
import { TempleModule } from './temple/temple.module';
import { TimingModule } from './timing/timing.module';
import { GroupModule } from './group/group.module';
import { MemberModule } from './member/member.module';
import { ServiceModule } from './service/service.module';
import { ServiceTypeModule } from './service-type/service-type.module';
import { ServiceCalendarModule } from './service-calendar/service-calendar.module';
import { AddressModule } from './address/address.module';
import { CronConfigModule } from './cron-config/cron-config.module';
import { ScheduleModule } from '@nestjs/schedule';
import { FamilyMemberModule } from './family-member/family-member.module';
import { CartModule } from './cart/cart.module';
import { OrderModule } from './order/order.module';
import { RazorPayModule } from './razor-pay/razor-pay.module';
import { NotificationModule } from './notification/notification.module';
import { NewsLetterModule } from './news-letter/news-letter.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerBehindProxyGuard } from './throttler';
import { LoggerService } from './logger.services';
import { DeityModule } from './deity/deity.module';
import { PaymentModule } from './payment/payment.module';
import { CcAvenueModule } from './cc-avenue/cc-avenue.module';
import { AssetModule } from './asset/asset.module';
import { AttachmentModule } from './attachment/attachment.module';
import { PremiumBookingsModule } from './premium-bookings/premium-bookings.module';
import { PropertyModule } from './property/property.module';
import { StripeModule } from './stripe/stripe.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET_APP,
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 40,
      },
    ]),
    PrismaModule,
    AuthModule,
    UserModule,
    AddressModule,
    TempleModule,
    TimingModule,
    GroupModule,
    MemberModule,
    ServiceModule,
    ServiceTypeModule,
    ServiceCalendarModule,
    CronConfigModule,
    CartModule,
    FamilyMemberModule,
    OrderModule,
    RazorPayModule,
    NotificationModule,
    NewsLetterModule,
    DeityModule,
    PaymentModule,
    // CcAvenueModule,
    AssetModule,
    AttachmentModule,
    PremiumBookingsModule,
    PropertyModule,
    StripeModule
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    AppService,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: ThrottlerBehindProxyGuard,
    },
    LoggerService,
  ],
})
export class AppModule {}
