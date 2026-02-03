import {
  Controller,
  Get,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  ClassSerializerInterceptor,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { UpdateCartDto } from './dto/update-cart.dto';
import { Permissions } from 'src/auth/permissions.decorator';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiHeader,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/utils/decorators/current-user.decorator';
import { UserAndRole } from 'src/user/user.model';
import { Cart } from './cart.model';
import { CartSwagger, ResetCartSwagger } from 'src/utils/swagger/cart.swagger';
import { ApiAuthGuard } from 'src/auth/jwt-auth.guard';
import { ErrorResponse } from 'src/utils/common/common.model';
import { ROLE_ADMIN, ROLE_USER } from 'src/const';
import { commonErrorCodes } from 'src/utils/helperFunction';
import { PrismaService } from 'src/prisma/prisma.service';
import { RolesGuard } from 'src/auth/permissions.guard';
import { MY_CART, RESET_CART, UPDATE_CART } from 'src/auth/permissions.const';

@ApiTags('cart')
@UseGuards(ApiAuthGuard, RolesGuard)
@ApiBearerAuth()
@ApiBadRequestResponse({
  type: ErrorResponse,
})
@ApiHeader({ name: 'role', enum: [ROLE_USER, ROLE_ADMIN] })
@UseInterceptors(ClassSerializerInterceptor)
@Controller('cart')
export class CartController {
  constructor(
    private readonly cartService: CartService,
    private readonly prisma: PrismaService,
  ) {}

  @Permissions(MY_CART)
  @Get('myCart')
  @ApiOkResponse({
    type: CartSwagger,
  })
  async myCart(@CurrentUser() user: UserAndRole) {
    const cart = await this.cartService.myCart(user);
    const carts: any = {
      id: cart.id,
      amount: cart.amount ? cart.amount : 0,
      checkout: cart.checkout,
      totalItemsQty: cart.totalItemsQty ? cart.totalItemsQty : 0,
      specialInstruction: cart.specialInstruction || null,
      cartItems: [],
    };
    cart.cartItems?.forEach((it) => {
      carts.cartItems.push({
        id: it.id,
        quantity: it.quantity,
        amount: it.amount,
        service: {
          id: it.serviceCalendar.service.id,
          title: it.serviceCalendar.service.title,
          price: it.serviceCalendar.service.price,
          currency: it.serviceCalendar.service.currency,
          serviceCalendars: [
            { id: it.serviceCalendar.id, date: it.serviceCalendar.date },
          ],
        },
        devotees: it.devotees && it.devotees.length ? it.devotees : null,
      });
    });
    return {
      message: 'Cart data fetched successfully',
      result: new Cart(carts),
    };
  }

  @Permissions(UPDATE_CART)
  @Put('update')
  @ApiOkResponse({
    status: 200,
    type: CartSwagger,
  })
  async updateCart(
    @Body() updateCartDto: UpdateCartDto,
    @CurrentUser() user: UserAndRole,
  ) {
    const cart = await this.cartService.myCart(user);
    const serviceCalender = await this.prisma.serviceCalendar.findFirst({
      where: {
        id: updateCartDto.serviceCalendarId,
        isActive: true,
      },
      include: {
        service: true,
      },
    });
    if (cart.templeId) {
      if (cart.templeId !== serviceCalender.service.templeId) {
        cart.validation = commonErrorCodes[301];
        return {
          message: 'Cart data fetched successfully',
          result: new Cart(cart),
        };
      }
    }
    if (cart.cartItems && cart.cartItems.length) {
      for (const service of cart.cartItems) {
        const existingService = await this.prisma.serviceCalendar.findUnique({
          where: { id: service.serviceCalendarId },
        });
        if (
          existingService.id === updateCartDto.serviceCalendarId &&
          updateCartDto.quantity === 1
        ) {
          throw new BadRequestException(`items already exists`);
        }
      }
    }
    const updatedCart = await this.cartService.updateCart(cart, updateCartDto);
    const carts: any = {
      id: updatedCart.id,
      amount: updatedCart.amount ? updatedCart.amount : 0,
      checkout: updatedCart.checkout,
      specialInstruction: cart.specialInstruction || null,
      totalItemsQty: updatedCart.totalItemsQty ? updatedCart.totalItemsQty : 0,
      cartItems: [],
    };
    updatedCart.cartItems?.forEach((it) => {
      carts.cartItems.push({
        id: it.id,
        quantity: it.quantity,
        amount: it.amount,
        service: {
          id: it.serviceCalendar.service.id,
          title: it.serviceCalendar.service.title,
          price: it.serviceCalendar.service.price,
          currency: it.serviceCalendar.service.currency,
          serviceCalendars: [
            { id: it.serviceCalendar.id, date: it.serviceCalendar.date },
          ],
        },
        devotees: it.devotees && it.devotees.length ? it.devotees : null,
      });
    });
    return {
      message: 'Cart data fetched successfully',
      result: new Cart(carts),
    };
  }

  @Permissions(RESET_CART)
  @Delete('reset/:id')
  @ApiOkResponse({
    status: 200,
    type: ResetCartSwagger,
  })
  async remove(@Param('id') id: string) {
    const cart = await this.cartService.remove(id);
    return { message: 'Cart data reset successfully', result: new Cart(cart) };
  }
}
