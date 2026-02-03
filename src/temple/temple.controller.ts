import { Controller, Get, UseGuards, UseInterceptors, ClassSerializerInterceptor, Param } from '@nestjs/common';
import { TempleService } from './temple.service';
import { Permissions } from 'src/auth/permissions.decorator';
import { ApiBadRequestResponse, ApiBearerAuth, ApiHeader, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaService } from 'src/prisma/prisma.service';
import { ErrorResponse } from 'src/utils/common/common.model';
import { ApiAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/permissions.guard';
import { CurrentUser } from 'src/utils/decorators/current-user.decorator';
import { UserAndRole } from 'src/user/user.model';
import { TempleSwagger, TempleSwaggerById } from 'src/utils/swagger/temple.swagger';
import { Temple } from './temple.model';
import { GET_ALL_TEMPLES, GET_TEMPLE } from 'src/auth/permissions.const';
import { ROLE_ADMIN, ROLE_GUEST, ROLE_USER } from 'src/const';

@ApiTags('temple')
@ApiBadRequestResponse({
  type: ErrorResponse,
})
@ApiHeader({ name: 'role', enum: [ROLE_ADMIN, ROLE_USER, ROLE_GUEST] })
@UseGuards(ApiAuthGuard, RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@ApiBearerAuth()
@Controller('temple')
export class TempleController {
  constructor(private readonly templeService: TempleService,
    private readonly prisma: PrismaService) { }

  /*@Post()
  create(@Body() createTempleDto: CreateTempleDto) {
    return this.templeService.create(createTempleDto);
  }*/

  @Permissions(GET_ALL_TEMPLES)
  @Get()
  @ApiOperation({ summary: 'Fetch All Temples' })
  @ApiOkResponse({
    type: TempleSwagger,
  })
  async findAll(@CurrentUser() user: UserAndRole) {
    const temples = await this.templeService.findAll(user);
    return {
      message: 'Temples fetched successfully',
      result: temples.map((it) => new Temple(it))
    };
  }

  @Permissions(GET_TEMPLE)
  @Get(':id')
  @ApiOperation({ summary: 'Fetch Temple' })
  @ApiOkResponse({
    type: TempleSwaggerById,
  })
  async findOne(@Param('id') id: string) {
    const temple = await this.templeService.findOne(id);
    return {
      message: 'Temple Fetched successfully',
      result: new Temple(temple),
    };
  }

  /*@Patch(':id')
  update(@Param('id') id: string, @Body() updateTempleDto: UpdateTempleDto) {
    return this.templeService.update(+id, updateTempleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.templeService.remove(+id);
  }*/
}
