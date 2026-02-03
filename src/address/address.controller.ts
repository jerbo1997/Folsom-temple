import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
  Put,
  UseInterceptors,
  ClassSerializerInterceptor,
  NotFoundException,
  BadGatewayException,
  BadRequestException,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { User } from 'src/user/user.model';
import { CurrentUser } from 'src/utils/decorators/current-user.decorator';
import { ApiAuthGuard } from 'src/auth/jwt-auth.guard';
import { Address } from './address.model';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ErrorResponse } from 'src/utils/common/common.model';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  AddressSwagger,
  AddressessSwagger,
  CreateAddressSwagger,
  DeleteAddressSwagger,
  UpdatedAddressSwagger,
} from 'src/utils/swagger/address.swagger';
import { Permissions } from 'src/auth/permissions.decorator';
import {
  CREATE_ADDRESS,
  DELETE_ADDRESS,
  FETCH_ADDRESS,
  FETCH_ALL_ADDRESS,
  UPDATE_ADDRESS,
} from 'src/auth/permissions.const';
import { RolesGuard } from 'src/auth/permissions.guard';
import { ROLE_ADMIN, ROLE_GUEST, ROLE_USER } from 'src/const';

@ApiTags('addresses')
@UseGuards(ApiAuthGuard, RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@ApiBadRequestResponse({
  type: ErrorResponse,
})
@Controller('addresses')
@ApiHeader({ name: 'role', enum: [ROLE_USER, ROLE_ADMIN, ROLE_GUEST] })
@ApiBearerAuth()
export class AddressController {
  constructor(
    private readonly addressService: AddressService,
    private readonly prisma: PrismaService,
  ) {}

  @Permissions(CREATE_ADDRESS)
  @Post()
  @ApiOkResponse({
    type: CreateAddressSwagger,
  })
  @ApiOperation({ summary: 'Create new Address' })
  async create(
    @Body() createAddressDto: CreateAddressDto,
    @CurrentUser() user: User,
  ) {
    const data = await this.addressService.create(createAddressDto, user);
    const result = new Address(data);
    return {
      message: 'New address created successfully',
      result,
    };
  }

  @Permissions(FETCH_ALL_ADDRESS)
  @Get()
  @ApiOkResponse({
    type: AddressessSwagger,
  })
  @ApiOperation({ summary: 'fetch all Address' })
  async findAll(@CurrentUser() user: User) {
    const data = await this.addressService.findAll(user);
    const result = data.map((it) => new Address(it));
    return {
      message: 'Address fetched successfully',
      result,
    };
  }

  @Permissions(FETCH_ADDRESS)
  @Get(':id')
  @ApiOkResponse({
    type: AddressSwagger,
  })
  @ApiOperation({ summary: 'fetch Address' })
  async findOne(@Param('id') id: string) {
    const data = await this.addressService.findOne(id);
    const result = new Address(data);
    return {
      message: 'Address fetched successfully',
      result,
    };
  }

  @Permissions(UPDATE_ADDRESS)
  @Put(':id')
  @ApiOkResponse({
    type: UpdatedAddressSwagger,
  })
  @ApiOperation({ summary: 'update Address' })
  async update(
    @Param('id') id: string,
    @Body() updateAdressDto: UpdateAddressDto,
    @CurrentUser()
    user: User,
  ) {
    const address = await this.addressService.findOne(id);
    if (address.user.id !== user.id) {
      throw new BadRequestException('User access denied');
    }
    const updateAddress = await this.addressService.update(id, updateAdressDto);
    return {
      message: 'Address fetched successfully',
      result: new Address(updateAddress),
    };
  }

  @Permissions(DELETE_ADDRESS)
  @Delete(':id')
  @ApiOkResponse({
    type: DeleteAddressSwagger,
  })
  @ApiOperation({ summary: 'delete Address' })
  async remove(
    @Param('id') id: string,
    @CurrentUser()
    user: User,
  ) {
    const address = await this.addressService.findOne(id);
    if (address.user.id !== user.id) {
      throw new BadRequestException('User access denied');
    }
    await this.addressService.remove(id);
    return {
      message: 'Address remove successfully',
      result: null,
    };
  }
}
