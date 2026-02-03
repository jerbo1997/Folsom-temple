import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ServiceTypeService } from './service-type.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ErrorResponse } from 'src/utils/common/common.model';
import { ApiAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/permissions.guard';
import { Permissions } from 'src/auth/permissions.decorator';
import { CurrentUser } from 'src/utils/decorators/current-user.decorator';
import { UserAndRole } from 'src/user/user.model';
import {
  GetAllServiceTypeSwagger,
  ServiceTypeSwagger,
  ServiceTypeSwaggerById,
} from 'src/utils/swagger/service-type.swagger';
import { ServiceType } from './service-type.model';
import {
  GET_ALL_SERVICETYPES,
  GET_SERVICETYPE,
} from 'src/auth/permissions.const';
import { ROLE_ADMIN, ROLE_GUEST, ROLE_USER } from 'src/const';

@ApiTags('serviceType')
@ApiBadRequestResponse({
  type: ErrorResponse,
})
@ApiHeader({ name: 'role', enum: [ROLE_ADMIN, ROLE_USER, ROLE_GUEST] })
@UseGuards(ApiAuthGuard, RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@ApiBearerAuth()
@Controller('serviceType')
export class ServiceTypeController {
  constructor(private readonly serviceTypeService: ServiceTypeService) {}

  /*@Post()
  create(@Body() createServiceTypeDto: CreateServiceTypeDto) {
    return this.serviceTypeService.create(createServiceTypeDto);
  }*/

  @Permissions(GET_SERVICETYPE)
  @Get('donation')
  @ApiOperation({ summary: 'Fetch ServiceType' })
  @ApiOkResponse({
    type: ServiceTypeSwaggerById,
  })
  async findOne() {
    const serviceType = await this.serviceTypeService.findOne();
    return {
      message: 'ServiceType Fetched successfully',
      result: new ServiceType(serviceType),
    };
  }

  @Permissions(GET_ALL_SERVICETYPES)
  @Get('admin')
  @ApiOperation({ summary: 'Fetch All ServiceTypes' })
  @ApiOkResponse({
    type: GetAllServiceTypeSwagger,
  })
  async getAllServiceType() {
    const serviceTypes = await this.serviceTypeService.getAll();
    return {
      message: 'ServiceTypes fetched successfully',
      result: serviceTypes.map((it) => new ServiceType(it)),
    };

    /*@Patch(':id')
  update(@Param('id') id: string, @Body() updateServiceTypeDto: UpdateServiceTypeDto) {
    return this.serviceTypeService.update(+id, updateServiceTypeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.serviceTypeService.remove(+id);
  }*/
  }

  @Permissions(GET_ALL_SERVICETYPES)
  @Get(':templeId')
  @ApiOperation({ summary: 'Fetch All ServiceTypes' })
  @ApiOkResponse({
    type: ServiceTypeSwagger,
  })
  async findAll(
    @Param('templeId') templeId: string,
    @CurrentUser() user: UserAndRole,
  ) {
    const serviceTypes = await this.serviceTypeService.findAll(templeId, user);
    return {
      message: 'ServiceTypes fetched successfully',
      result: serviceTypes.map((it) => new ServiceType(it)),
    };
  }
}
