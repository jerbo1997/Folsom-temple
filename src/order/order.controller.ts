import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  Req,
  Body,
  Get,
  Param,
  Query,
  BadRequestException,
  HttpCode,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { Permissions } from 'src/auth/permissions.decorator';
import { ApiAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/permissions.guard';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  BOOKED_VASTRAMS,
  CREATED_VASTRAMS,
  DONATION,
  ORDER_REPORTS,
  ROLE_ADMIN,
  ROLE_USER,
  WEBHOOK_FAILURE,
  WEBHOOK_SUCCESS,
} from 'src/const';
import { CurrentUser } from 'src/utils/decorators/current-user.decorator';
import { CreateOrder, OrdersCount, getAllOrdersCount } from './order.model';
import { ErrorResponse } from 'src/utils/common/common.model';
import { PrismaService } from 'src/prisma/prisma.service';
import { dateInputValidation, webhook } from 'src/utils/helperFunction';
import {
  CreateOrderSwagger,
  FetcheOrderCountSwagger,
  FetcheOrderSwagger,
} from 'src/utils/swagger/order.swagger';
import {
  CREATE_DONATION,
  CREATE_ORDER,
  GET_ALL_ADMIN_EVENTS,
  GET_ALL_ORDERS,
  GET_ALL_ORDERS_COUNT,
  GET_ALL_USER_EVENTS,
  GET_ORDERS_COUNT,
  GET_ORDER_BY_ID,
} from 'src/auth/permissions.const';
import {
  CreateAdminOrder,
  CreateInstantOrderDto,
} from './dto/create-order.dto';
import { User } from 'src/user/user.model';

@ApiTags('orders')
@ApiBadRequestResponse({
  type: ErrorResponse,
})
@UseInterceptors(ClassSerializerInterceptor)
@Controller('orders')
@ApiBearerAuth()
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly prisma: PrismaService,
  ) {}

  @Permissions(CREATE_ORDER)
  @Post('createOrder')
  @UseGuards(ApiAuthGuard, RolesGuard)
  @ApiHeader({ name: 'role', enum: [ROLE_USER, ROLE_ADMIN] })
  @ApiOperation({ summary: 'Create Order' })
  @ApiOkResponse({ type: CreateOrderSwagger })
  @ApiBody({ type: CreateAdminOrder, required: false })
  async create(
    @CurrentUser() user: User,
    @Body() input?: CreateAdminOrder | any,
  ) {
    const order: any = await this.orderService.create(user, input);
    return {
      message: 'Order creation Sucessfully',
      result: new CreateOrder(order),
    };
  }

  //Flow for instant order and donation
  @Permissions(CREATE_DONATION)
  @Post('instant')
  @UseGuards(ApiAuthGuard, RolesGuard)
  @ApiHeader({ name: 'role', enum: [ROLE_ADMIN, ROLE_USER] })
  @ApiOperation({ summary: 'create donation or instant order' })
  @ApiBody({ type: CreateInstantOrderDto })
  @ApiOkResponse({ type: CreateOrderSwagger })
  async placeOrder(
    @CurrentUser() user: User,
    @Body() input: CreateInstantOrderDto,
    @Req() req,
  ) {
    const orders: any = await this.orderService.placeOrder(
      user,
      input,
      req.headers.role,
    );
    return {
      message: 'order fetched succussfully',
      result: new CreateOrder(orders),
    };
  }

  @Permissions(GET_ALL_ORDERS)
  @Get()
  @UseGuards(ApiAuthGuard, RolesGuard)
  @ApiHeader({ name: 'role', enum: [ROLE_ADMIN, ROLE_USER] })
  @ApiOperation({ summary: 'Get all orders' })
  @ApiOkResponse({ type: FetcheOrderSwagger })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({
    name: 'status',
    enum: [WEBHOOK_SUCCESS, WEBHOOK_FAILURE],
    required: false,
  })
  @ApiQuery({ name: 'type', enum: [DONATION], required: false })
  @ApiQuery({ name: 'screenName', enum: [ORDER_REPORTS], required: false })
  async orders(
    @CurrentUser() user: User,
    @Query('type') type: string,
    @Query('status') status: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('screenName') screenName: string,
    @Req() req,
  ) {
    if (startDate || endDate) {
      dateInputValidation(startDate || undefined, endDate || undefined);
    }
    const orders: any = await this.orderService.findAll(
      user,
      status,
      type,
      startDate,
      endDate,
      req.headers.role,
      screenName,
    );
    return {
      message: 'order fetched succussfully',
      result: orders.map((it) => new CreateOrder(it)),
    };
  }

  @Permissions(GET_ORDERS_COUNT)
  @Get('ordersCount')
  @UseGuards(ApiAuthGuard, RolesGuard)
  @ApiHeader({ name: 'role', enum: [ROLE_ADMIN, ROLE_USER] })
  @ApiOperation({ summary: 'Get orders count' })
  @ApiOkResponse({ type: FetcheOrderCountSwagger })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({
    name: 'status',
    enum: [WEBHOOK_SUCCESS, WEBHOOK_FAILURE],
    required: false,
  })
  @ApiQuery({ name: 'type', enum: [DONATION], required: false })
  async getOrdersCount(
    @CurrentUser() user: User,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('status') status: string,
    @Query('type') type: string,
  ) {
    await dateInputValidation(startDate || undefined, endDate || undefined);
    const ordersCountawait: any = await this.orderService.getOrdersCount(
      user,
      startDate,
      endDate,
      status,
      type,
    );
    return {
      message: 'order fetched succussfully',
      result: new OrdersCount(ordersCountawait),
    };
  }

  @Get('status/:orderId')
  @UseGuards(ApiAuthGuard)
  async orderStatus(
    @CurrentUser() user: User,
    @Param('orderId') orderId: string,
  ) {
    const order = await this.prisma.order.findFirst({
      where: { orderId },
    });
    if (!order) {
      throw new BadRequestException(
        'Sorry something went wrong, please try again later',
      );
    }
    const response = await this.orderService.orderStatus(orderId);
    return {
      message: 'Order status fetched successfully',
      result: response,
    };
  }

  @Permissions(GET_ALL_ORDERS_COUNT)
  @Get('orderAllcounts')
  @UseGuards(ApiAuthGuard, RolesGuard)
  @ApiHeader({ name: 'role', enum: [ROLE_ADMIN] })
  @ApiOperation({ summary: 'Get orders all count' })
  @ApiOkResponse({ type: FetcheOrderCountSwagger })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getAllOrdersCount(
    @CurrentUser() user: User,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    await dateInputValidation(startDate || undefined, endDate || undefined);
    const ordersCountawait: any = await this.orderService.getAllOrdersCount(
      user,
      startDate,
      endDate,
    );
    return {
      message: 'order fetched succussfully',
      result: new getAllOrdersCount(ordersCountawait),
    };
  }

  @Permissions(GET_ALL_ADMIN_EVENTS)
  @Get('events')
  @UseGuards(ApiAuthGuard, RolesGuard)
  @ApiHeader({ name: 'role', enum: [ROLE_ADMIN] })
  @ApiOperation({ summary: 'Get all events' })
  @ApiOkResponse({ type: FetcheOrderSwagger })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({
    name: 'status',
    enum: [WEBHOOK_SUCCESS, WEBHOOK_FAILURE],
    required: false,
  })
  async events(
    @CurrentUser() user: User,
    @Query('status') status: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    await dateInputValidation(startDate || undefined, endDate || undefined);
    const orders: any = await this.orderService.events(
      user,
      status,
      startDate,
      endDate,
    );
    return {
      message: 'orders fetched succussfully',
      result: orders.map((it) => new CreateOrder(it)),
    };
  }

  @Permissions(GET_ALL_USER_EVENTS)
  @Get('events/user')
  @UseGuards(ApiAuthGuard, RolesGuard)
  @ApiHeader({ name: 'role', enum: [ROLE_USER] })
  @ApiOperation({ summary: 'Get all events' })
  @ApiOkResponse({ type: FetcheOrderSwagger })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({
    name: 'status',
    enum: [WEBHOOK_SUCCESS, WEBHOOK_FAILURE],
    required: false,
  })
  async userEvents(
    @CurrentUser() user: User,
    @Query('status') status: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const orders: any = await this.orderService.userEvents(
      user,
      status,
      startDate,
      endDate,
    );
    return {
      message: 'orders fetched succussfully',
      result: orders.map((it) => new CreateOrder(it)),
    };
  }

  @Permissions(GET_ALL_ORDERS)
  @Get('createdVastrams')
  @UseGuards(ApiAuthGuard, RolesGuard)
  @ApiHeader({ name: 'role', enum: [ROLE_ADMIN] })
  @ApiOperation({ summary: 'Get all created vastram orders' })
  @ApiOkResponse({ type: FetcheOrderSwagger })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async createdVastramOrders(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    await dateInputValidation(startDate || undefined, endDate || undefined);
    const orders: any = await this.orderService.vastramOrders(
      startDate,
      endDate,
      CREATED_VASTRAMS,
    );
    return {
      message: 'order fetched succussfully',
      result: orders.map((it) => new CreateOrder(it)),
    };
  }

  @Permissions(GET_ALL_ORDERS)
  @Get('bookedVastrams')
  @UseGuards(ApiAuthGuard, RolesGuard)
  @ApiHeader({ name: 'role', enum: [ROLE_ADMIN] })
  @ApiOperation({ summary: 'Get all booked vastram orders' })
  @ApiOkResponse({ type: FetcheOrderSwagger })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async bookedVastramOrders(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Req() req,
  ) {
    await dateInputValidation(startDate || undefined, endDate || undefined);
    const orders: any = await this.orderService.vastramOrders(
      startDate,
      endDate,
      BOOKED_VASTRAMS,
    );
    return {
      message: 'order fetched succussfully',
      result: orders.map((it) => new CreateOrder(it)),
    };
  }

  @Permissions(GET_ORDER_BY_ID)
  @Get(':id')
  @UseGuards(ApiAuthGuard, RolesGuard)
  @ApiHeader({ name: 'role', enum: [ROLE_ADMIN, ROLE_USER] })
  @ApiOperation({ summary: 'Get order by id' })
  @ApiOkResponse({ type: CreateOrderSwagger })
  async orderById(@Param('id') id: string, @CurrentUser() user: User) {
    const orders: any = await this.orderService.findOne(id, user);
    return {
      message: 'order count fetched succussfully',
      result: new CreateOrder(orders),
    };
  }

  @HttpCode(200)
  @Post('/webhook')
  async orderWebhook(@Req() req) {
    console.log(
      JSON.stringify(req.body.payload),
      '<<<<<<<<<< Payload >>>>>>>>>>>>',
    );
    try {
      const data = webhook(req.body);
      await this.orderService.orderWebhook(data);
    } catch (error) {
      console.log('error>>>', error);
    }
    return { message: 'success' };
  }
}
